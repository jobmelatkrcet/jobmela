import io
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings, RequestFactory
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import DisallowedHost
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from accounts.models import User
from accounts.storage import (
    PHOTO_MAX_BYTES,
    upload_file_to_supabase,
    delete_file_from_supabase,
    get_signed_file_url,
    validate_photo_file,
    validate_resume_file,
    clean_supabase_url,
    clean_supabase_key,
    clean_bucket_name,
    infer_supabase_url_from_db,
    get_canonical_mime_type,
    SupabaseStorageError,
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
        # Photo exceeds 3MB limit
        large_photo = SimpleUploadedFile("big.jpg", b"\xff\xd8\xff\xe0" + b"x" * (PHOTO_MAX_BYTES + 10), content_type="image/jpeg")
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

    # 11. Storage configuration sanitization
    def test_11_storage_configuration_sanitization(self):
        """Test URL, key, bucket, and DB inference sanitization against whitespace, quotes, and invalid prefixes."""
        # URL with quotes, spaces, trailing slash
        self.assertEqual(
            clean_supabase_url('  "https://xyz.supabase.co/"  '),
            "https://xyz.supabase.co",
        )
        # URL missing scheme
        self.assertEqual(
            clean_supabase_url("xyz.supabase.co"),
            "https://xyz.supabase.co",
        )
        # URL with accidental /storage/v1 subpath
        self.assertEqual(
            clean_supabase_url("https://xyz.supabase.co/storage/v1"),
            "https://xyz.supabase.co",
        )
        # Key with quotes and whitespace
        self.assertEqual(
            clean_supabase_key("  'eyJh.service_role_secret' \n"),
            "eyJh.service_role_secret",
        )
        # Bucket name with quotes and spaces
        self.assertEqual(
            clean_bucket_name('  "student-documents"  '),
            "student-documents",
        )
        # DB URL project ref inference
        with override_settings(
            DATABASE_URL="postgresql://postgres.myproject123:mypassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
        ):
            self.assertEqual(infer_supabase_url_from_db(), "https://myproject123.supabase.co")

    # 12. Canonical MIME type resolution
    def test_12_canonical_mime_type_resolution(self):
        """Test that file extensions map to canonical MIME types allowed by Supabase storage."""
        self.assertEqual(get_canonical_mime_type(".jpg"), "image/jpeg")
        self.assertEqual(get_canonical_mime_type(".jpeg"), "image/jpeg")
        self.assertEqual(get_canonical_mime_type(".png"), "image/png")
        self.assertEqual(get_canonical_mime_type(".webp"), "image/webp")
        self.assertEqual(get_canonical_mime_type(".pdf"), "application/pdf")
        self.assertEqual(get_canonical_mime_type(".doc"), "application/msword")
        self.assertEqual(
            get_canonical_mime_type(".docx"),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

    # 13. Storage permission error (403 / RLS) handling
    @override_settings(
        SUPABASE_URL="https://test.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-key",
    )
    def test_13_storage_permission_error_handling(self):
        """Test clear field-level message when Supabase returns a 403 or policy error without leaking secrets."""
        with patch("accounts.serializers.upload_file_to_supabase") as mock_upload:
            mock_upload.side_effect = SupabaseStorageError(
                user_message="Storage permission error while uploading photograph. Please contact the administrator or register without attachments.",
                technical_message="Storage upload error (status=403, bucket=student-documents): row-level security policy violated",
                status_code=403,
            )
            payload = self.valid_payload.copy()
            payload["photo"] = self.get_valid_photo()
            res = self.client.post(self.register_url, data=payload, format="multipart")
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("photo", res.data)
            self.assertIn("Storage permission error while uploading photograph", str(res.data["photo"]))
            # Never leak internal technical status or database policy details to the client
            self.assertNotIn("row-level security", str(res.data["photo"]))
            self.assertNotIn("test-key", str(res.data["photo"]))

    # 14. Storage bucket not found (404) handling
    @override_settings(
        SUPABASE_URL="https://test.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-key",
    )
    def test_14_storage_bucket_not_found_handling(self):
        """Test clear field-level message when Supabase bucket is missing."""
        with patch("accounts.serializers.upload_file_to_supabase") as mock_upload:
            mock_upload.side_effect = SupabaseStorageError(
                user_message="Storage bucket 'student-documents' was not found. Please contact the administrator or register without attachments.",
                technical_message="Storage upload error (status=404, bucket=student-documents): Bucket not found",
                status_code=404,
            )
            payload = self.valid_payload.copy()
            payload["photo"] = self.get_valid_photo()
            res = self.client.post(self.register_url, data=payload, format="multipart")
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("photo", res.data)
            self.assertIn("Storage bucket 'student-documents' was not found", str(res.data["photo"]))

    # 15. Direct upload_file_to_supabase execution with mocked Supabase client
    @override_settings(
        SUPABASE_URL="https://test.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-key",
        SUPABASE_STORAGE_BUCKET="student-documents",
    )
    @patch("accounts.storage.get_supabase_client")
    def test_15_upload_file_to_supabase_direct_success(self, mock_get_client):
        """Test upload_file_to_supabase calls client upload with canonical MIME type and upsert enabled."""
        mock_client = MagicMock()
        mock_bucket = MagicMock()
        mock_client.storage.from_.return_value = mock_bucket
        mock_get_client.return_value = mock_client

        photo = self.get_valid_photo("candidate.jpg")
        stored_path = upload_file_to_supabase(photo, folder_prefix="photos")

        self.assertTrue(stored_path.startswith("photos/"))
        self.assertTrue(stored_path.endswith(".jpg"))

        mock_bucket.upload.assert_called_once()
        _, kwargs = mock_bucket.upload.call_args
        self.assertEqual(kwargs["path"], stored_path)
        self.assertEqual(kwargs["file_options"]["content-type"], "image/jpeg")
        self.assertEqual(kwargs["file_options"]["upsert"], "true")

    # 16. Registration with heard_about set to WhatsApp Ads
    def test_16_registration_with_heard_about_whatsapp(self):
        """Test registration successfully saves 'WhatsApp Ads' as heard_about source."""
        payload = self.valid_payload.copy()
        payload["email"] = "whatsapp_cand@tkrcet.ac.in"
        payload["heard_about"] = "WhatsApp Ads"
        response = self.client.post(self.register_url, data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["heard_about"], "WhatsApp Ads")
        user = User.objects.get(email="whatsapp_cand@tkrcet.ac.in")
        self.assertEqual(user.heard_about, "WhatsApp Ads")
        self.assertEqual(user.referral_source, "WhatsApp Ads")

    # 17. Registration with heard_about set to Instagram Ads / Reels
    def test_17_registration_with_heard_about_instagram(self):
        """Test registration successfully saves 'Instagram Ads / Reels' as heard_about source."""
        payload = self.valid_payload.copy()
        payload["email"] = "insta_cand@tkrcet.ac.in"
        payload["heard_about"] = "Instagram Ads / Reels"
        response = self.client.post(self.register_url, data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["heard_about"], "Instagram Ads / Reels")
        user = User.objects.get(email="insta_cand@tkrcet.ac.in")
        self.assertEqual(user.heard_about, "Instagram Ads / Reels")

    # 18. Registration with custom manual Others entry
    def test_18_registration_with_heard_about_other_manual(self):
        """Test registration successfully saves custom manual input for Others."""
        payload = self.valid_payload.copy()
        payload["email"] = "other_cand@tkrcet.ac.in"
        payload["heard_about"] = "Other: College Notice Board"
        response = self.client.post(self.register_url, data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["heard_about"], "Other: College Notice Board")
        user = User.objects.get(email="other_cand@tkrcet.ac.in")
        self.assertEqual(user.heard_about, "Other: College Notice Board")

    # 19. Photo below 3 MB accepted by size validation
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
        SUPABASE_STORAGE_BUCKET="student-documents",
    )
    @patch("accounts.serializers.upload_file_to_supabase")
    @patch("accounts.serializers.get_signed_file_url")
    def test_19_photo_below_3mb_accepted(self, mock_signed_url, mock_upload):
        """Test a photo below 3 MB (e.g. 1 MB) is accepted by size validation and registration succeeds."""
        mock_upload.return_value = "photos/token/photo_below_3m.jpg"
        mock_signed_url.return_value = "https://test.supabase.co/storage/v1/photo_below_3m.jpg"

        photo_1m_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * (1024 * 1024 - 4)
        photo_1m = SimpleUploadedFile("candidate_1m.jpg", photo_1m_bytes, content_type="image/jpeg")

        # Direct storage validation check
        self.assertEqual(validate_photo_file(photo_1m), photo_1m)

        # Endpoint registration check
        payload = self.valid_payload.copy()
        payload["email"] = "below3m@tkrcet.ac.in"
        payload["photo"] = photo_1m
        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="below3m@tkrcet.ac.in").exists())

    # 20. Photo exactly at 3 MB (3,145,728 bytes) accepted
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
        SUPABASE_STORAGE_BUCKET="student-documents",
    )
    @patch("accounts.serializers.upload_file_to_supabase")
    @patch("accounts.serializers.get_signed_file_url")
    def test_20_photo_exactly_at_3mb_accepted(self, mock_signed_url, mock_upload):
        """Test a photo exactly at the 3 MB limit (3,145,728 bytes) is accepted by size validation."""
        mock_upload.return_value = "photos/token/photo_exact_3m.jpg"
        mock_signed_url.return_value = "https://test.supabase.co/storage/v1/photo_exact_3m.jpg"

        exact_3m_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * (PHOTO_MAX_BYTES - 4)
        self.assertEqual(len(exact_3m_bytes), PHOTO_MAX_BYTES)
        photo_exact = SimpleUploadedFile("exact_3m.jpg", exact_3m_bytes, content_type="image/jpeg")

        # Direct storage validation check
        self.assertEqual(validate_photo_file(photo_exact), photo_exact)

        # Endpoint registration check
        payload = self.valid_payload.copy()
        payload["email"] = "exact3m@tkrcet.ac.in"
        payload["photo"] = photo_exact
        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="exact3m@tkrcet.ac.in").exists())

    # 21. Photo above 3 MB (e.g. 3,145,729 bytes) rejected by backend
    def test_21_photo_above_3mb_rejected(self):
        """Test a photo above 3 MB is rejected with the exact validation error message."""
        over_3m_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * (PHOTO_MAX_BYTES - 3)  # 3,145,729 bytes
        self.assertEqual(len(over_3m_bytes), PHOTO_MAX_BYTES + 1)
        photo_over = SimpleUploadedFile("over_3m.jpg", over_3m_bytes, content_type="image/jpeg")

        # Direct storage validation check
        with self.assertRaises(ValidationError) as cm:
            validate_photo_file(photo_over)
        self.assertIn("Photo file size exceeds 3MB limit.", str(cm.exception))

        # Endpoint registration check
        payload = self.valid_payload.copy()
        payload["email"] = "over3m@tkrcet.ac.in"
        payload["photo"] = photo_over
        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("photo", res.data)
        self.assertIn("Photo file size exceeds 3MB limit.", str(res.data["photo"]))
        self.assertFalse(User.objects.filter(email="over3m@tkrcet.ac.in").exists())

    # 22. Request bypassing frontend validation still rejected by Django
    def test_22_request_bypassing_frontend_rejected_by_django(self):
        """Test an API client bypassing frontend checks and submitting an oversized photo is rejected by Django."""
        # 4 MB image submitted directly via HTTP client
        bypassing_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * (4 * 1024 * 1024)
        bypassing_photo = SimpleUploadedFile("bypass.jpg", bypassing_bytes, content_type="image/jpeg")

        payload = self.valid_payload.copy()
        payload["email"] = "bypasser@tkrcet.ac.in"
        payload["photo"] = bypassing_photo

        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("photo", res.data)
        self.assertEqual(
            res.data["photo"],
            ["Photo file size exceeds 3MB limit."],
        )
        self.assertFalse(User.objects.filter(email="bypasser@tkrcet.ac.in").exists())

    # 23. Spoofed size attribute bypassing client still rejected by Django
    def test_23_photo_with_spoofed_size_attribute_rejected_by_stream_inspection(self):
        """Test that if file.size is falsely reported as small, actual stream length is measured and rejected."""
        stream_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * (3500 * 1024)
        spoofed_photo = SimpleUploadedFile("spoofed.jpg", stream_bytes, content_type="image/jpeg")
        spoofed_photo.size = 100  # Spoofed attribute claiming it's only 100 bytes!

        with self.assertRaises(ValidationError) as cm:
            validate_photo_file(spoofed_photo)
        self.assertIn("Photo file size exceeds 3MB limit.", str(cm.exception))

    # 24. Concurrent upload of both photo and resume succeeds
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
        SUPABASE_STORAGE_BUCKET="student-documents",
    )
    @patch("accounts.serializers.upload_file_to_supabase")
    @patch("accounts.serializers.get_signed_file_url")
    def test_24_concurrent_upload_both_files_success(self, mock_signed_url, mock_upload):
        """Test concurrent upload of both photo and resume attaches both files to the new candidate."""
        def upload_mock_handler(file_obj, folder_prefix="documents"):
            return f"{folder_prefix}/test_token/{getattr(file_obj, 'name', 'file')}"

        mock_upload.side_effect = upload_mock_handler
        mock_signed_url.side_effect = lambda path: f"https://signed-url.com/{path}"

        payload = self.valid_payload.copy()
        payload["email"] = "concurrent_upload@tkrcet.ac.in"
        payload["photo"] = self.get_valid_photo("candidate.jpg")
        payload["resume"] = self.get_valid_resume("resume.pdf")

        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email="concurrent_upload@tkrcet.ac.in")
        self.assertTrue(user.photo.name.startswith("photos/"))
        self.assertTrue(user.resume.name.startswith("resumes/"))
        self.assertEqual(mock_upload.call_count, 2)

    # 25. Storage failure on photo cleans up uploaded resume
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
    )
    @patch("accounts.serializers.delete_file_from_supabase")
    @patch("accounts.serializers.upload_file_to_supabase")
    def test_25_storage_failure_photo_cleans_up_resume(self, mock_upload, mock_delete):
        """Test that if photo upload fails while resume succeeds, the uploaded resume is cleaned up."""
        def upload_mock_handler(file_obj, folder_prefix="documents"):
            if folder_prefix == "photos":
                raise SupabaseStorageError(
                    user_message="Storage error on photo upload.",
                    technical_message="Simulated 500 error",
                )
            return "resumes/token/resume.pdf"

        mock_upload.side_effect = upload_mock_handler

        payload = self.valid_payload.copy()
        payload["email"] = "photo_fail@tkrcet.ac.in"
        payload["photo"] = self.get_valid_photo("candidate.jpg")
        payload["resume"] = self.get_valid_resume("resume.pdf")

        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("photo", res.data)
        self.assertIn("Storage error on photo upload.", str(res.data["photo"]))

        # Verify any uploaded resume was deleted from storage
        mock_delete.assert_called_with("resumes/token/resume.pdf")
        self.assertFalse(User.objects.filter(email="photo_fail@tkrcet.ac.in").exists())

    # 26. Storage failure on resume cleans up uploaded photo
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
    )
    @patch("accounts.serializers.delete_file_from_supabase")
    @patch("accounts.serializers.upload_file_to_supabase")
    def test_26_storage_failure_resume_cleans_up_photo(self, mock_upload, mock_delete):
        """Test that if resume upload fails while photo succeeds, the uploaded photo is cleaned up."""
        def upload_mock_handler(file_obj, folder_prefix="documents"):
            if folder_prefix == "resumes":
                raise SupabaseStorageError(
                    user_message="Storage error on resume upload.",
                    technical_message="Simulated 503 error",
                )
            return "photos/token/photo.jpg"

        mock_upload.side_effect = upload_mock_handler

        payload = self.valid_payload.copy()
        payload["email"] = "resume_fail@tkrcet.ac.in"
        payload["photo"] = self.get_valid_photo("candidate.jpg")
        payload["resume"] = self.get_valid_resume("resume.pdf")

        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("resume", res.data)
        self.assertIn("Storage error on resume upload.", str(res.data["resume"]))

        # Verify uploaded photo was deleted from storage
        mock_delete.assert_called_with("photos/token/photo.jpg")
        self.assertFalse(User.objects.filter(email="resume_fail@tkrcet.ac.in").exists())

    # 27. Database failure rolls back user and cleans up all uploaded files
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
    )
    @patch("accounts.serializers.delete_file_from_supabase")
    @patch("accounts.models.CustomUserManager.create_user")
    @patch("accounts.serializers.upload_file_to_supabase")
    def test_27_db_failure_cleans_up_all_uploaded_files(self, mock_upload, mock_create_user, mock_delete):
        """Test atomic rollback: if DB user creation fails, all uploaded files are cleaned up from storage."""
        mock_upload.side_effect = [
            "photos/token/photo.jpg",
            "resumes/token/resume.pdf",
        ]
        mock_create_user.side_effect = Exception("Simulated database connection crash")

        payload = self.valid_payload.copy()
        payload["email"] = "db_crash@tkrcet.ac.in"
        payload["photo"] = self.get_valid_photo("candidate.jpg")
        payload["resume"] = self.get_valid_resume("resume.pdf")

        with self.assertRaises(Exception) as cm:
            self.client.post(self.register_url, data=payload, format="multipart")
        self.assertIn("Simulated database connection crash", str(cm.exception))

        # Both files must be cleaned up from storage
        delete_calls = [call[0][0] for call in mock_delete.call_args_list]
        self.assertIn("photos/token/photo.jpg", delete_calls)
        self.assertIn("resumes/token/resume.pdf", delete_calls)
        self.assertFalse(User.objects.filter(email="db_crash@tkrcet.ac.in").exists())

    # 28. Exact trailing slash routing for registration endpoint
    def test_28_routing_registration_endpoint_requires_trailing_slash(self):
        """Test OPTIONS on exact /api/auth/register/ responds with 200 without redirecting."""
        res = self.client.options(self.register_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("POST", res.headers.get("Allow", ""))

    # 29. Canonical domains are present in ALLOWED_HOSTS
    def test_29_routing_allowed_hosts_includes_canonical_domains(self):
        """Test ALLOWED_HOSTS configuration includes both canonical tkrcetjobmela.in domains."""
        from django.conf import settings
        self.assertIn("tkrcetjobmela.in", settings.ALLOWED_HOSTS)
        self.assertIn("www.tkrcetjobmela.in", settings.ALLOWED_HOSTS)

    # 30. CORS settings disallow unrestricted wildcard and trust canonical domain
    def test_30_cors_settings_disallow_unrestricted_wildcard(self):
        """Test CORS does not permit unrestricted wildcard '*' by default and trusts tkrcetjobmela.in."""
        from django.conf import settings
        self.assertFalse(settings.CORS_ALLOW_ALL_ORIGINS)
        self.assertIn("https://www.tkrcetjobmela.in", settings.CORS_ALLOWED_ORIGINS)
        self.assertIn("https://tkrcetjobmela.in", settings.CORS_ALLOWED_ORIGINS)
        self.assertIn("https://www.tkrcetjobmela.in", settings.CSRF_TRUSTED_ORIGINS)

    # 31. Preflight OPTIONS CORS request from canonical domain
    def test_31_options_preflight_for_canonical_domain(self):
        """Test OPTIONS preflight request with Origin header from canonical domain returns CORS headers."""
        res = self.client.options(
            self.register_url,
            HTTP_ORIGIN="https://www.tkrcetjobmela.in",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.headers.get("Access-Control-Allow-Origin"), "https://www.tkrcetjobmela.in")

    # 32. Concurrent upload where both files fail reports both errors
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
    )
    @patch("accounts.serializers.upload_file_to_supabase")
    def test_32_concurrent_upload_both_fail_reports_both_errors(self, mock_upload):
        """Test concurrent upload reporting: when both photo and resume fail, both errors are returned."""
        def upload_mock_handler(file_obj, folder_prefix="documents"):
            if folder_prefix == "photos":
                raise SupabaseStorageError(
                    user_message="Photo upload server error.",
                    technical_message="Simulated 500 error",
                )
            if folder_prefix == "resumes":
                raise SupabaseStorageError(
                    user_message="Resume upload server error.",
                    technical_message="Simulated 503 error",
                )
            return "documents/token/file.bin"

        mock_upload.side_effect = upload_mock_handler

        payload = self.valid_payload.copy()
        payload["email"] = "both_fail@tkrcet.ac.in"
        payload["photo"] = self.get_valid_photo("candidate.jpg")
        payload["resume"] = self.get_valid_resume("resume.pdf")

        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("photo", res.data)
        self.assertIn("resume", res.data)
        self.assertIn("Photo upload server error.", str(res.data["photo"]))
        self.assertIn("Resume upload server error.", str(res.data["resume"]))
        self.assertFalse(User.objects.filter(email="both_fail@tkrcet.ac.in").exists())

    # 33. Combined attachments exceeding 4 MB rejected
    @override_settings(
        SUPABASE_URL="https://test-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-service-role-key",
        SUPABASE_STORAGE_BUCKET="student-documents",
    )
    def test_33_combined_attachments_exceeding_4mb_rejected(self):
        """Test backend validation rejects requests where combined photo and resume exceed 4 MB."""
        photo_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * (2500 * 1024 - 4)  # 2.5 MB photo
        resume_bytes = b"%PDF-1.4\n" + b"\x00" * (2000 * 1024 - 9)       # 2.0 MB resume (Total: 4.5 MB)

        large_photo = SimpleUploadedFile("cand.jpg", photo_bytes, content_type="image/jpeg")
        large_resume = SimpleUploadedFile("cv.pdf", resume_bytes, content_type="application/pdf")

        payload = self.valid_payload.copy()
        payload["email"] = "combined_over@tkrcet.ac.in"
        payload["photo"] = large_photo
        payload["resume"] = large_resume

        res = self.client.post(self.register_url, data=payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("The combined size of photo and resume exceeds 4MB. Please reduce attachment sizes.", str(res.data))
        self.assertFalse(User.objects.filter(email="combined_over@tkrcet.ac.in").exists())


class VercelAllowedHostsTests(TestCase):
    """Automated tests for Vercel deployment hostnames and custom domains in ALLOWED_HOSTS."""

    def setUp(self):
        self.rf = RequestFactory()
        self.client = APIClient()

    def test_stable_backend_hostname_accepted(self):
        """Stable backend hostname 'jobmela-z1tj.vercel.app' is accepted."""
        res = self.client.get("/api/auth/profile/", HTTP_HOST="jobmela-z1tj.vercel.app")
        # Should reach DRF authentication and return 401 Unauthorized, NOT 400 DisallowedHost
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_deployment_specific_hostname_accepted(self):
        """Changing deployment-specific Vercel URLs for jobmela-z1tj are accepted without manual addition."""
        deployment_urls = [
            "jobmela-z1tj-kx0dawdyb-jobmela.vercel.app",
            "jobmela-z1tj-of2fcjb4f-jobmela.vercel.app",
            "jobmela-z1tj-git-fix-safe-api-rewrite-jobmela.vercel.app",
            "jobmela-z1tj-xyz789.vercel.app",
        ]
        for url in deployment_urls:
            with self.subTest(url=url):
                res = self.client.get("/api/auth/profile/", HTTP_HOST=url)
                # Successful host resolution reaches endpoint (returns 401 Unauthorized, NOT 400 DisallowedHost)
                self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_custom_domains_accepted(self):
        """Canonical custom domains tkrcetjobmela.in and www.tkrcetjobmela.in are accepted."""
        for domain in ("tkrcetjobmela.in", "www.tkrcetjobmela.in"):
            with self.subTest(domain=domain):
                res = self.client.get("/api/auth/profile/", HTTP_HOST=domain)
                self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_local_development_hosts_accepted(self):
        """Localhost, 127.0.0.1, and [::1] are accepted."""
        for host in ("localhost", "127.0.0.1", "[::1]", "testserver"):
            with self.subTest(host=host):
                res = self.client.get("/api/auth/profile/", HTTP_HOST=host)
                self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_arbitrary_vercel_app_rejected(self):
        """Arbitrary external Vercel applications and third-party domains are rejected with DisallowedHost."""
        bad_hosts = [
            "attacker-jobmela.vercel.app",
            "attacker.vercel.app",
            "random-user.vercel.app",
            "jobmela-z1tj.attacker.com",
            "tkrcetjobmela.in.attacker.com",
            "evil.com",
        ]
        for host in bad_hosts:
            with self.subTest(host=host):
                res = self.client.get("/api/auth/profile/", HTTP_HOST=host)
                # DisallowedHost returns 400 Bad Request
                self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="resetstudent@tkrcet.ac.in",
            password="OriginalPassword123!",
            full_name="Reset Test Student",
            mobile="9876543210",
        )
        self.request_url = "/api/auth/password-reset/"
        self.validate_url = "/api/auth/password-reset/validate/"
        self.confirm_url = "/api/auth/password-reset/confirm/"

    def test_password_reset_request_for_existing_user(self):
        from django.core import mail
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        response = self.client.post(
            self.request_url,
            data={"email": "resetstudent@tkrcet.ac.in"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

        # Check outbox email
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn("Password Reset Request", sent_email.subject)
        self.assertEqual(sent_email.to, ["resetstudent@tkrcet.ac.in"])

        expected_uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        self.assertIn(expected_uid, sent_email.body)

    def test_password_reset_request_anti_enumeration_for_nonexistent_email(self):
        from django.core import mail

        response = self.client.post(
            self.request_url,
            data={"email": "nonexistent@tkrcet.ac.in"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        # No email should be sent for nonexistent account
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_validate_token(self):
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.contrib.auth.tokens import default_token_generator

        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        valid_token = default_token_generator.make_token(self.user)

        # Valid token
        res_valid = self.client.get(f"{self.validate_url}?uid={uidb64}&token={valid_token}")
        self.assertEqual(res_valid.status_code, status.HTTP_200_OK)
        self.assertTrue(res_valid.data.get("valid"))

        # Invalid token
        res_invalid = self.client.get(f"{self.validate_url}?uid={uidb64}&token=invalid-fake-token")
        self.assertEqual(res_invalid.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res_invalid.data.get("valid"))

    def test_password_reset_confirm_success_and_single_use(self):
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.contrib.auth.tokens import default_token_generator

        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        # 1. Password mismatch fails
        mismatch_payload = {
            "uid": uidb64,
            "token": token,
            "new_password": "NewSecretPassword123!",
            "confirm_password": "DifferentPassword123!",
        }
        res_mismatch = self.client.post(self.confirm_url, data=mismatch_payload, format="json")
        self.assertEqual(res_mismatch.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. Confirm succeeds
        success_payload = {
            "uid": uidb64,
            "token": token,
            "new_password": "BrandNewPassword123!",
            "confirm_password": "BrandNewPassword123!",
        }
        res_success = self.client.post(self.confirm_url, data=success_payload, format="json")
        self.assertEqual(res_success.status_code, status.HTTP_200_OK)

        # Verify old password fails and new password works
        self.user.refresh_from_db()
        self.assertFalse(self.user.check_password("OriginalPassword123!"))
        self.assertTrue(self.user.check_password("BrandNewPassword123!"))

        # 3. Re-using the same token fails (single-use guarantee)
        res_reuse = self.client.post(self.confirm_url, data=success_payload, format="json")
        self.assertEqual(res_reuse.status_code, status.HTTP_400_BAD_REQUEST)





