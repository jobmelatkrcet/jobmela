from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import StudentRegistrationSerializer, LoginSerializer, UserSerializer


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
