import io
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from accounts.models import User
from accounts.storage import (
    upload_file_to_supabase,
    delete_file_from_supabase,
    get_signed_file_url,
    validate_photo_file,
    validate_resume_file,
)


class StudentRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = "/api/auth/register/"
        self.valid_payload = {
            "full_name": "Test Candidate",
            "email": "testcandidate@tkrcet.ac.in",
            "mobile": "9876543210",
            "qualification": "B.Tech (CSE / IT)",
            "college": "TKR College of Engineering & Technology",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
        }

        # Valid binary fixtures with proper magic bytes
        self.valid_photo_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100
        self.valid_resume_bytes = b"%PDF-1.4\n%testpdf\n" + b"\x00" * 100

    def get_valid_photo(self, name="candidate.jpg"):
        return SimpleUploadedFile(name, self.valid_photo_bytes, content_type="image/jpeg")

    def get_valid_resume(self, name="resume.pdf"):
        return SimpleUploadedFile(name, self.valid_resume_bytes, content_type="application/pdf")

    # 1. Registration with JSON and no attachments
    def test_1_registration_with_json_and_no_attachments(self):
        """Test registration succeeds when submitted as JSON with no attachments."""
        response = self.client.post(
            self.register_url,
            data=self.valid_payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "testcandidate@tkrcet.ac.in")
        self.assertEqual(response.data["user"]["role"], "student")

        user = User.objects.get(email="testcandidate@tkrcet.ac.in")
        self.assertTrue(user.check_password("SecurePassword123!"))
        self.assertTrue(Token.objects.filter(user=user).exists())
        self.assertFalse(bool(user.photo))
        self.assertFalse(bool(user.resume))

    # 2. Registration with multipart data and no attachments
    def test_2_registration_with_multipart_and_no_attachments(self):
        """Test registration succeeds with multipart parsing when no files are attached."""
        response = self.client.post(
            self.register_url,
            data=self.valid_payload,
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertTrue(User.objects.filter(email="testcandidate@tkrcet.ac.in").exists())

    # 3. Successful photo upload using mocked Supabase Storage
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
        SUPABASE_STORAGE_BUCKET="student-documents",
    )
    @patch("accounts.serializers.upload_file_to_supabase")
    @patch("accounts.serializers.get_signed_file_url")
    def test_3_successful_photo_upload_mocked_supabase(self, mock_signed_url, mock_upload):
        """Test photograph is uploaded to Supabase Storage and stored as object path."""
        mock_upload.return_value = "photos/cand_uuid/photo_123.jpg"
        mock_signed_url.return_value = "https://test-project.supabase.co/storage/v1/object/sign/student-documents/photos/cand_uuid/photo_123.jpg?token=mocktoken"

        payload = self.valid_payload.copy()
        payload["photo"] = self.get_valid_photo()

        response = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)

        user = User.objects.get(email="testcandidate@tkrcet.ac.in")
        self.assertEqual(user.photo.name, "photos/cand_uuid/photo_123.jpg")
        self.assertFalse(bool(user.resume))
        mock_upload.assert_called_once()
        self.assertEqual(response.data["user"]["photo"], mock_signed_url.return_value)

    # 4. Successful resume upload using mocked Supabase Storage
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
        SUPABASE_STORAGE_BUCKET="student-documents",
    )
    @patch("accounts.serializers.upload_file_to_supabase")
    @patch("accounts.serializers.get_signed_file_url")
    def test_4_successful_resume_upload_mocked_supabase(self, mock_signed_url, mock_upload):
        """Test resume is uploaded to Supabase Storage and stored as object path."""
        mock_upload.return_value = "resumes/cand_uuid/resume_456.pdf"
        mock_signed_url.return_value = "https://test-project.supabase.co/storage/v1/object/sign/student-documents/resumes/cand_uuid/resume_456.pdf?token=mocktoken"

        payload = self.valid_payload.copy()
        payload["resume"] = self.get_valid_resume()

        response = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email="testcandidate@tkrcet.ac.in")
        self.assertEqual(user.resume.name, "resumes/cand_uuid/resume_456.pdf")
        self.assertFalse(bool(user.photo))
        mock_upload.assert_called_once()
        self.assertEqual(response.data["user"]["resume"], mock_signed_url.return_value)

    # 5. Successful registration with both files
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
        SUPABASE_STORAGE_BUCKET="student-documents",
    )
    @patch("accounts.serializers.upload_file_to_supabase")
    @patch("accounts.serializers.get_signed_file_url")
    def test_5_successful_registration_with_both_files(self, mock_signed_url, mock_upload):
        """Test registration with both photo and resume uploaded to Supabase Storage."""
        mock_upload.side_effect = [
            "photos/cand_uuid/photo.jpg",
            "resumes/cand_uuid/resume.pdf",
        ]
        mock_signed_url.side_effect = lambda path: f"https://signed-url.com/{path}?token=abc"

        payload = self.valid_payload.copy()
        payload["photo"] = self.get_valid_photo()
        payload["resume"] = self.get_valid_resume()

        response = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email="testcandidate@tkrcet.ac.in")
        self.assertEqual(user.photo.name, "photos/cand_uuid/photo.jpg")
        self.assertEqual(user.resume.name, "resumes/cand_uuid/resume.pdf")
        self.assertEqual(mock_upload.call_count, 2)

    # 6. Invalid file types and files exceeding size limits
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
    )
    def test_6_invalid_file_types_and_size_limits(self):
        """Test backend validation enforces size limits and authentic file types."""
        # Photo exceeds 3MB
        large_photo = SimpleUploadedFile("big.jpg", b"\xff\xd8\xff\xe0" + b"x" * (3 * 1024 * 1024 + 10), content_type="image/jpeg")
        payload = self.valid_payload.copy()
        payload["photo"] = large_photo
        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("photo", res.data)
        self.assertIn("Photo file size exceeds 3MB limit.", str(res.data["photo"]))

        # Photo invalid type (fake extension, corrupt bytes)
        fake_photo = SimpleUploadedFile("script.jpg", b"#!/bin/bash echo hello", content_type="image/jpeg")
        payload = self.valid_payload.copy()
        payload["photo"] = fake_photo
        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("photo", res.data)
        self.assertIn("Please upload a valid image file", str(res.data["photo"]))

        # Resume exceeds 5MB
        large_resume = SimpleUploadedFile("big.pdf", b"%PDF-1.4\n" + b"x" * (5 * 1024 * 1024 + 10), content_type="application/pdf")
        payload = self.valid_payload.copy()
        payload["resume"] = large_resume
        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("resume", res.data)
        self.assertIn("Resume file size exceeds 5MB limit.", str(res.data["resume"]))

        # Resume invalid format (executable disguised as PDF)
        fake_resume = SimpleUploadedFile("fake.pdf", b"MZ\x90\x00\x03\x00\x00\x00", content_type="application/pdf")
        payload = self.valid_payload.copy()
        payload["resume"] = fake_resume
        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("resume", res.data)
        self.assertIn("Please upload a PDF, DOC, or DOCX document.", str(res.data["resume"]))

    # 7. Storage unavailable or upload failure
    def test_7_storage_unavailable_or_upload_failure(self):
        """Test clear 400 validation error when storage credentials are not configured or upload fails."""
        # A. Unconfigured storage
        with override_settings(SUPABASE_URL="", SUPABASE_SERVICE_ROLE_KEY=""):
            payload = self.valid_payload.copy()
            payload["photo"] = self.get_valid_photo()
            res = self.client.post(self.register_url, data=payload, format="multipart")
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("photo", res.data)
            self.assertIn("cloud storage is not configured", str(res.data["photo"]))

        # B. Storage configured but upload raises unexpected error
        with override_settings(
            SUPABASE_URL="https://test.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY="test-key",
        ):
            with patch("accounts.serializers.upload_file_to_supabase", side_effect=Exception("Storage API down")):
                payload = self.valid_payload.copy()
                payload["photo"] = self.get_valid_photo()
                res = self.client.post(self.register_url, data=payload, format="multipart")
                self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn("photo", res.data)
                self.assertIn("Failed to upload photograph to storage", str(res.data["photo"]))
                # Must not leak internal traceback or secret
                self.assertNotIn("Storage API down", str(res.data["photo"]))

    # 8. Cleanup of uploaded objects when account creation fails
    @override_settings(
        SUPABASE_URL="https://test.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-key",
    )
    @patch("accounts.serializers.delete_file_from_supabase")
    @patch("accounts.serializers.upload_file_to_supabase")
    def test_8_cleanup_of_uploaded_objects_on_failure(self, mock_upload, mock_delete):
        """Test previously uploaded files are cleaned up from storage if user creation fails."""
        mock_upload.side_effect = [
            "photos/token/photo.jpg",
            Exception("Simulated resume network drop"),
        ]

        payload = self.valid_payload.copy()
        payload["photo"] = self.get_valid_photo()
        payload["resume"] = self.get_valid_resume()

        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        # Verify photo was cleaned up after resume failure
        mock_delete.assert_called_with("photos/token/photo.jpg")
        self.assertFalse(User.objects.filter(email="testcandidate@tkrcet.ac.in").exists())

    # 9. Duplicate email and password validation
    def test_9_duplicate_email_and_password_validation(self):
        """Test duplicate email rejection and password rules."""
        self.client.post(self.register_url, data=self.valid_payload, format="json")

        # Duplicate email
        dup_payload = self.valid_payload.copy()
        dup_payload["email"] = "TESTCANDIDATE@TKRCET.AC.IN"
        res = self.client.post(self.register_url, data=dup_payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", res.data)
        self.assertIn("An account with this email already exists.", str(res.data["email"]))

        # Password mismatch
        mismatch_payload = self.valid_payload.copy()
        mismatch_payload["email"] = "mismatch@tkrcet.ac.in"
        mismatch_payload["confirm_password"] = "DiffPass123!"
        res = self.client.post(self.register_url, data=mismatch_payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", res.data)

        # Password < 6 chars
        short_payload = self.valid_payload.copy()
        short_payload["email"] = "short@tkrcet.ac.in"
        short_payload["password"] = "12345"
        short_payload["confirm_password"] = "12345"
        res = self.client.post(self.register_url, data=short_payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", res.data)

    # 10. Unauthorized attempts to access another student's documents
    @override_settings(
        SUPABASE_URL="https://test.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-key",
    )
    @patch("accounts.storage.get_signed_file_url")
    def test_10_unauthorized_attempts_to_access_another_students_documents(self, mock_signed_url):
        """Test private document download endpoint enforces strict authorization."""
        mock_signed_url.return_value = "https://test.supabase.co/storage/v1/object/sign/doc.pdf?token=valid"

        # Create Student A
        student_a = User.objects.create_user(
            email="student_a@tkrcet.ac.in",
            password="Password123!",
            full_name="Student A",
            resume="resumes/a/resume.pdf",
        )
        token_a = Token.objects.create(user=student_a)

        # Create Student B
        student_b = User.objects.create_user(
            email="student_b@tkrcet.ac.in",
            password="Password123!",
            full_name="Student B",
            resume="resumes/b/resume.pdf",
        )
        token_b = Token.objects.create(user=student_b)

        # Create Admin
        admin_user = User.objects.create_superuser(
            email="admin@tkrcet.ac.in",
            password="AdminPassword123!",
            full_name="Admin Coordinator",
        )
        token_admin = Token.objects.create(user=admin_user)

        # A. Unauthenticated request -> 401
        res = self.client.get(f"/api/auth/students/{student_b.id}/document/resume/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # B. Student A attempts to access Student B's document -> 403 Forbidden!
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token_a.key}")
        res = self.client.get(f"/api/auth/students/{student_b.id}/document/resume/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # C. Student A accesses their own document via document endpoint -> 200 OK
        res = self.client.get("/api/auth/document/resume/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["url"], mock_signed_url.return_value)

        # D. Admin accesses Student B's document -> 200 OK
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token_admin.key}")
        res = self.client.get(f"/api/auth/students/{student_b.id}/document/resume/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["url"], mock_signed_url.return_value)
