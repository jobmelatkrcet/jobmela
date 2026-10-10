from rest_framework import serializers
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
)


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
            "photo",
            "resume",
            "password",
            "confirm_password",
        ]
        extra_kwargs = {
            "photo": {"required": False, "allow_null": True},
            "resume": {"required": False, "allow_null": True},
        }

    def validate_photo(self, value):
        if value:
            if not is_cloud_storage_configured():
                raise serializers.ValidationError(
                    "Photo uploads are currently unavailable because cloud storage is not configured. Please register without attaching a photo."
                )
            validate_photo_file(value)
        return value

    def validate_resume(self, value):
        if value:
            if not is_cloud_storage_configured():
                raise serializers.ValidationError(
                    "Resume uploads are currently unavailable because cloud storage is not configured. Please register without attaching a resume."
                )
            validate_resume_file(value)
        return value

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized_email

    def validate(self, data):
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        photo_file = validated_data.pop("photo", None)
        resume_file = validated_data.pop("resume", None)

        uploaded_cleanup = []
        photo_path = None
        resume_path = None

        try:
            if photo_file:
                try:
                    photo_path = upload_file_to_supabase(photo_file, folder_prefix="photos")
                    uploaded_cleanup.append(photo_path)
                except Exception:
                    raise serializers.ValidationError(
                        {"photo": "Failed to upload photograph to storage. Please try again."}
                    )

            if resume_file:
                try:
                    resume_path = upload_file_to_supabase(resume_file, folder_prefix="resumes")
                    uploaded_cleanup.append(resume_path)
                except Exception:
                    for p in uploaded_cleanup:
                        delete_file_from_supabase(p)
                    raise serializers.ValidationError(
                        {"resume": "Failed to upload resume to storage. Please try again."}
                    )

            user = User.objects.create_user(
                email=validated_data["email"],
                password=password,
                full_name=validated_data.get("full_name", "").strip(),
                mobile=validated_data.get("mobile", "").strip(),
                qualification=validated_data.get("qualification", "").strip(),
                college=validated_data.get("college", "").strip(),
                role="student",
            )

            if photo_path:
                user.photo = photo_path
            if resume_path:
                user.resume = resume_path
            if photo_path or resume_path:
                user.save(update_fields=["photo", "resume"])

            return user

        except serializers.ValidationError:
            raise
        except Exception as exc:
            for p in uploaded_cleanup:
                delete_file_from_supabase(p)
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
            "photo",
            "resume",
            "role",
            "is_staff",
            "created_at",
        ]
        read_only_fields = ["id", "role", "is_staff", "created_at"]

    def validate_photo(self, value):
        if value:
            if not is_cloud_storage_configured():
                raise serializers.ValidationError(
                    "Photo uploads are currently unavailable because cloud storage is not configured."
                )
            validate_photo_file(value)
        return value

    def validate_resume(self, value):
        if value:
            if not is_cloud_storage_configured():
                raise serializers.ValidationError(
                    "Resume uploads are currently unavailable because cloud storage is not configured."
                )
            validate_resume_file(value)
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
