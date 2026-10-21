from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from .models import User
from .serializers import (
    StudentRegistrationSerializer,
    LoginSerializer,
    UserSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .email import send_password_reset_email


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StudentRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            user_data = UserSerializer(user).data
            return Response(
                {
                    "message": "Registration successful! Welcome to TKRCET Job Mela 2026.",
                    "token": token.key,
                    "user": user_data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            token, _ = Token.objects.get_or_create(user=user)
            user_data = UserSerializer(user).data
            return Response(
                {
                    "message": "Login successful.",
                    "token": token.key,
                    "user": user_data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Delete auth token
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Profile updated successfully.", "user": serializer.data}
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentDocumentDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, document_type):
        doc_type = document_type.lower().strip()
        if doc_type not in ("photo", "resume"):
            return Response(
                {"detail": "Invalid document type. Allowed types: photo, resume."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_field = getattr(request.user, doc_type, None)
        if not file_field or not file_field.name:
            return Response(
                {"detail": f"No {doc_type} attached for this account."},
                status=status.HTTP_404_NOT_FOUND,
            )

        from accounts.storage import get_signed_file_url
        signed_url = get_signed_file_url(file_field.name, expires_in=300)
        if not signed_url:
            return Response(
                {"detail": "Storage service is currently unavailable or unconfigured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if request.query_params.get("redirect") == "true":
            from django.http import HttpResponseRedirect
            return HttpResponseRedirect(signed_url)

        return Response(
            {
                "document_type": doc_type,
                "url": signed_url,
                "expires_in": 300,
            },
            status=status.HTTP_200_OK,
        )


class AdminStudentDocumentDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id, document_type):
        doc_type = document_type.lower().strip()
        if doc_type not in ("photo", "resume"):
            return Response(
                {"detail": "Invalid document type. Allowed types: photo, resume."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.user.id != student_id and not request.user.is_admin_user:
            return Response(
                {"detail": "You do not have permission to access another candidate's document."},
                status=status.HTTP_403_FORBIDDEN,
            )

        target_student = User.objects.filter(id=student_id).first()
        if not target_student:
            return Response(
                {"detail": "Candidate not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        file_field = getattr(target_student, doc_type, None)
        if not file_field or not file_field.name:
            return Response(
                {"detail": f"No {doc_type} attached for this candidate."},
                status=status.HTTP_404_NOT_FOUND,
            )

        from accounts.storage import get_signed_file_url
        signed_url = get_signed_file_url(file_field.name, expires_in=300)
        if not signed_url:
            return Response(
                {"detail": "Storage service is currently unavailable or unconfigured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if request.query_params.get("redirect") == "true":
            from django.http import HttpResponseRedirect
            return HttpResponseRedirect(signed_url)

        return Response(
            {
                "document_type": doc_type,
                "student_id": student_id,
                "url": signed_url,
                "expires_in": 300,
            },
            status=status.HTTP_200_OK,
        )


def _get_frontend_base_url(request):
    origin = request.headers.get("Origin")
    if origin and (settings.DEBUG or origin in getattr(settings, "CORS_ALLOWED_ORIGINS", [])):
        return origin.rstrip("/")
    referer = request.headers.get("Referer")
    if referer:
        from urllib.parse import urlparse
        parsed = urlparse(referer)
        candidate = f"{parsed.scheme}://{parsed.netloc}"
        if settings.DEBUG or candidate in getattr(settings, "CORS_ALLOWED_ORIGINS", []):
            return candidate.rstrip("/")
    base = getattr(settings, "FRONTEND_URL", "https://www.tkrcetjobmela.in")
    return base.rstrip("/")


class PasswordResetRequestView(APIView):
    """
    Initiates a password reset request. Sends an email with a secure token link.
    Maintains anti-enumeration security by returning HTTP 200 regardless of whether
    the account exists.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()

        dev_url = None
        if user:
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_base = _get_frontend_base_url(request)
            reset_url = f"{frontend_base}/reset-password/{uidb64}/{token}/"
            dev_url = reset_url

            # Send email
            send_password_reset_email(user, reset_url)

        response_payload = {
            "message": "If an account with that email address exists, a password reset link has been sent to your email.",
        }
        if getattr(settings, "DEBUG", False) and dev_url:
            response_payload["dev_reset_url"] = dev_url

        return Response(response_payload, status=status.HTTP_200_OK)


class PasswordResetValidateTokenView(APIView):
    """
    Validates whether a reset token is valid and unexpired before prompting the user
    for a new password.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        uid_b64 = request.query_params.get("uid", "").strip()
        token = request.query_params.get("token", "").strip()

        if not uid_b64 or not token:
            return Response(
                {"valid": False, "detail": "Reset token and user identification are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.filter(pk=user_id, is_active=True).first()
        except (TypeError, ValueError, OverflowError):
            user = None

        if not user or not default_token_generator.check_token(user, token):
            return Response(
                {"valid": False, "detail": "This password reset link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mask email for privacy: e.g. "ra***@tkrcet.ac.in"
        parts = user.email.split("@")
        masked = parts[0][:2] + "***@" + parts[1] if len(parts) == 2 and len(parts[0]) > 2 else user.email

        return Response(
            {
                "valid": True,
                "email": masked,
                "full_name": user.full_name,
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    Confirms password reset and updates user password after verifying the token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        new_password = serializer.validated_data["new_password"]

        user.set_password(new_password)
        user.save(update_fields=["password"])

        # Revoke existing auth tokens to require re-authentication with new password
        Token.objects.filter(user=user).delete()

        return Response(
            {
                "message": "Password has been successfully updated. You may now log in with your new password.",
            },
            status=status.HTTP_200_OK,
        )

