import io
from unittest.mock import patch
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from accounts.models import User


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

    def test_registration_with_json_and_no_attachments(self):
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

        # Verify DB and Token
        user = User.objects.get(email="testcandidate@tkrcet.ac.in")
        self.assertTrue(user.check_password("SecurePassword123!"))
        self.assertTrue(Token.objects.filter(user=user).exists())
        self.assertFalse(bool(user.photo))
        self.assertFalse(bool(user.resume))

    def test_registration_with_multipart_and_no_attachments(self):
        """Test registration succeeds with multipart parsing when no files are attached."""
        response = self.client.post(
            self.register_url,
            data=self.valid_payload,
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertTrue(User.objects.filter(email="testcandidate@tkrcet.ac.in").exists())

    def test_registration_photo_attachment_rejected_when_cloud_storage_not_configured(self):
        """Test submitting a photo returns 400 validation error when cloud storage is missing."""
        payload = self.valid_payload.copy()
        payload["photo"] = SimpleUploadedFile(
            "candidate.jpg",
            b"fake_image_binary_data",
            content_type="image/jpeg",
        )

        response = self.client.post(
            self.register_url,
            data=payload,
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("photo", response.data)
        self.assertIn(
            "Photo uploads are currently unavailable because cloud storage is not configured. Please register without attaching a photo.",
            str(response.data["photo"]),
        )
        # Ensure user was not created
        self.assertFalse(User.objects.filter(email="testcandidate@tkrcet.ac.in").exists())

    def test_registration_resume_attachment_rejected_when_cloud_storage_not_configured(self):
        """Test submitting a resume returns 400 validation error when cloud storage is missing."""
        payload = self.valid_payload.copy()
        payload["resume"] = SimpleUploadedFile(
            "resume.pdf",
            b"fake_pdf_binary_data",
            content_type="application/pdf",
        )

        response = self.client.post(
            self.register_url,
            data=payload,
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("resume", response.data)
        self.assertIn(
            "Resume uploads are currently unavailable because cloud storage is not configured. Please register without attaching a resume.",
            str(response.data["resume"]),
        )
        # Ensure user was not created
        self.assertFalse(User.objects.filter(email="testcandidate@tkrcet.ac.in").exists())

    def test_duplicate_email_validation(self):
        """Test registration rejects duplicate email case-insensitively."""
        # Create initial student
        self.client.post(self.register_url, data=self.valid_payload, format="json")

        # Attempt to register with uppercase variant
        duplicate_payload = self.valid_payload.copy()
        duplicate_payload["email"] = "TESTCANDIDATE@TKRCET.AC.IN"

        response = self.client.post(self.register_url, data=duplicate_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertIn("An account with this email already exists.", str(response.data["email"]))

    def test_password_validation(self):
        """Test password mismatch and minimum length validation."""
        # Mismatched passwords
        mismatch_payload = self.valid_payload.copy()
        mismatch_payload["confirm_password"] = "DifferentPassword123!"

        response = self.client.post(self.register_url, data=mismatch_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", response.data)
        self.assertIn("Passwords do not match.", str(response.data["confirm_password"]))

        # Password too short (< 6 chars)
        short_pwd_payload = self.valid_payload.copy()
        short_pwd_payload["password"] = "12345"
        short_pwd_payload["confirm_password"] = "12345"

        response = self.client.post(self.register_url, data=short_pwd_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    @patch("accounts.serializers.is_cloud_storage_configured", return_value=True)
    def test_attachments_allowed_when_cloud_storage_is_configured(self, mock_storage_check):
        """Test registration with attachments passes validation when cloud storage is configured."""
        payload = self.valid_payload.copy()
        payload["photo"] = SimpleUploadedFile(
            "candidate.jpg",
            b"fake_image_binary_data",
            content_type="image/jpeg",
        )
        payload["resume"] = SimpleUploadedFile(
            "resume.pdf",
            b"fake_pdf_binary_data",
            content_type="application/pdf",
        )

        with patch("django.core.files.storage.FileSystemStorage.save", return_value="photos/candidate.jpg"):
            response = self.client.post(
                self.register_url,
                data=payload,
                format="multipart",
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertTrue(User.objects.filter(email="testcandidate@tkrcet.ac.in").exists())
