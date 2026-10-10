from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    StudentDocumentDownloadView,
    AdminStudentDocumentDownloadView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("profile/", ProfileView.as_view(), name="auth-profile"),
    path("document/<str:document_type>/", StudentDocumentDownloadView.as_view(), name="auth-document"),
    path("students/<int:student_id>/document/<str:document_type>/", AdminStudentDocumentDownloadView.as_view(), name="admin-student-document"),
]
