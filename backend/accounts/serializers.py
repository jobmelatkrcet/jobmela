from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User


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
        photo = validated_data.get("photo", None)
        resume = validated_data.get("resume", None)
        user = User.objects.create_user(
            email=validated_data["email"],
            password=password,
            full_name=validated_data.get("full_name", "").strip(),
            mobile=validated_data.get("mobile", "").strip(),
            qualification=validated_data.get("qualification", "").strip(),
            college=validated_data.get("college", "").strip(),
            photo=photo,
            resume=resume,
            role="student",
        )
        return user


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
