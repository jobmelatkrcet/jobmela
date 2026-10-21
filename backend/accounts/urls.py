from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    StudentDocumentDownloadView,
    AdminStudentDocumentDownloadView,
    PasswordResetRequestView,
    PasswordResetValidateTokenView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("profile/", ProfileView.as_view(), name="auth-profile"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="auth-password-reset-request"),
    path("password-reset/validate/", PasswordResetValidateTokenView.as_view(), name="auth-password-reset-validate"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
    path("document/<str:document_type>/", StudentDocumentDownloadView.as_view(), name="auth-document"),
    path("students/<int:student_id>/document/<str:document_type>/", AdminStudentDocumentDownloadView.as_view(), name="admin-student-document"),
]
