import logging
from rest_framework import serializers
from concurrent.futures import ThreadPoolExecutor
from django.db import transaction
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User
from .storage import (
    is_cloud_storage_configured,
    validate_photo_file,
    validate_resume_file,
    upload_file_to_supabase,
    delete_file_from_supabase,
    get_signed_file_url,
    SupabaseStorageError,
)

logger = logging.getLogger(__name__)


class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        min_length=6,
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "mobile",
            "qualification",
            "college",
            "heard_about",
            "photo",
            "resume",
            "password",
            "confirm_password",
        ]
        extra_kwargs = {
            "photo": {"required": False, "allow_null": True},
            "resume": {"required": False, "allow_null": True},
            "heard_about": {"required": False, "allow_blank": True},
        }

    def validate_photo(self, value):
        if value:
            validate_photo_file(value)
            if not is_cloud_storage_configured():
                raise serializers.ValidationError(
                    "Photo uploads are currently unavailable because cloud storage is not configured. Please register without attaching a photo."
                )
        return value

    def validate_resume(self, value):
        if value:
            validate_resume_file(value)
            if not is_cloud_storage_configured():
                raise serializers.ValidationError(
                    "Resume uploads are currently unavailable because cloud storage is not configured. Please register without attaching a resume."
                )
        return value

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized_email

    def validate(self, data):
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        # Support referral_source as alias for heard_about if provided
        if not data.get("heard_about") and self.initial_data.get("referral_source"):
            data["heard_about"] = str(self.initial_data.get("referral_source")).strip()

        # Enforce combined attachment ceiling to protect against serverless request-body drops
        photo = data.get("photo")
        resume = data.get("resume")
        if photo and resume:
            p_size = getattr(photo, "size", 0) or 0
            r_size = getattr(resume, "size", 0) or 0
            if p_size + r_size > 4 * 1024 * 1024:
                raise serializers.ValidationError(
                    {"non_field_errors": ["The combined size of photo and resume exceeds 4MB. Please reduce attachment sizes."]}
                )
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        photo_file = validated_data.pop("photo", None)
        resume_file = validated_data.pop("resume", None)

        uploaded_cleanup = []
        photo_path = None
        resume_path = None

        def _upload_photo():
            try:
                path = upload_file_to_supabase(photo_file, folder_prefix="photos")
                return ("photo", path, None)
            except SupabaseStorageError as sse:
                logger.warning("Candidate photo upload failed: %s", sse.technical_message)
                return ("photo", None, serializers.ValidationError({"photo": sse.user_message}))
            except Exception as exc:
                logger.exception("Unexpected error uploading candidate photograph: %s", str(exc))
                return (
                    "photo",
                    None,
                    serializers.ValidationError({"photo": "Failed to upload photograph to storage. Please try again."}),
                )

        def _upload_resume():
            try:
                path = upload_file_to_supabase(resume_file, folder_prefix="resumes")
                return ("resume", path, None)
            except SupabaseStorageError as sse:
                logger.warning("Candidate resume upload failed: %s", sse.technical_message)
                return ("resume", None, serializers.ValidationError({"resume": sse.user_message}))
            except Exception as exc:
                logger.exception("Unexpected error uploading candidate resume: %s", str(exc))
                return (
                    "resume",
                    None,
                    serializers.ValidationError({"resume": "Failed to upload resume to storage. Please try again."}),
                )

        try:
            # Upload files to Supabase Storage (concurrently if both are present to reduce serverless latency)
            if photo_file and resume_file:
                with ThreadPoolExecutor(max_workers=2) as executor:
                    f_photo = executor.submit(_upload_photo)
                    f_resume = executor.submit(_upload_resume)
                    _, p_path, p_err = f_photo.result()
                    _, r_path, r_err = f_resume.result()

                if p_path:
                    photo_path = p_path
                    uploaded_cleanup.append(p_path)
                if r_path:
                    resume_path = r_path
                    uploaded_cleanup.append(r_path)

                # Report both upload failures if both failed
                if p_err and r_err:
                    combined_errors = {}
                    if hasattr(p_err, "detail") and isinstance(p_err.detail, dict):
                        combined_errors.update(p_err.detail)
                    else:
                        combined_errors["photo"] = str(p_err)

                    if hasattr(r_err, "detail") and isinstance(r_err.detail, dict):
                        combined_errors.update(r_err.detail)
                    else:
                        combined_errors["resume"] = str(r_err)

                    raise serializers.ValidationError(combined_errors)
                elif p_err:
                    raise p_err
                elif r_err:
                    raise r_err

            elif photo_file:
                _, p_path, p_err = _upload_photo()
                if p_err:
                    raise p_err
                photo_path = p_path
                uploaded_cleanup.append(p_path)

            elif resume_file:
                _, r_path, r_err = _upload_resume()
                if r_err:
                    raise r_err
                resume_path = r_path
                uploaded_cleanup.append(r_path)

            # Atomic database transaction ensures no partially created accounts are left behind
            with transaction.atomic():
                user = User.objects.create_user(
                    email=validated_data["email"],
                    password=password,
                    full_name=validated_data.get("full_name", "").strip(),
                    mobile=validated_data.get("mobile", "").strip(),
                    qualification=validated_data.get("qualification", "").strip(),
                    college=validated_data.get("college", "").strip(),
                    heard_about=validated_data.get("heard_about", "").strip(),
                    role="student",
                )

                if photo_path:
                    user.photo = photo_path
                if resume_path:
                    user.resume = resume_path
                if photo_path or resume_path:
                    user.save(update_fields=["photo", "resume"])

            return user

        except Exception as exc:
            for p in uploaded_cleanup:
                try:
                    delete_file_from_supabase(p)
                except Exception as clean_err:
                    logger.warning("Failed to clean up file %s during rollback: %s", p, str(clean_err))
            raise exc


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "mobile",
            "qualification",
            "college",
            "heard_about",
            "photo",
            "resume",
            "role",
            "is_staff",
            "created_at",
        ]
        read_only_fields = ["id", "role", "is_staff", "created_at"]

    def validate_photo(self, value):
        if value:
            validate_photo_file(value)
            if not is_cloud_storage_configured():
                raise serializers.ValidationError(
                    "Photo uploads are currently unavailable because cloud storage is not configured."
                )
        return value

    def validate_resume(self, value):
        if value:
            validate_resume_file(value)
            if not is_cloud_storage_configured():
                raise serializers.ValidationError(
                    "Resume uploads are currently unavailable because cloud storage is not configured."
                )
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.photo:
            signed = get_signed_file_url(instance.photo.name)
            data["photo"] = signed or instance.photo.name
        if instance.resume:
            signed = get_signed_file_url(instance.resume.name)
            data["resume"] = signed or instance.resume.name
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        email = data.get("email", "").lower().strip()
        password = data.get("password", "")

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        user = authenticate(username=email, password=password)
        if not user:
            # Check if user exists but inactive
            user_exists = User.objects.filter(email__iexact=email).first()
            if user_exists and not user_exists.is_active:
                raise serializers.ValidationError("This account has been disabled.")
            raise serializers.ValidationError("Invalid email or password.")

        data["user"] = user
        return data
