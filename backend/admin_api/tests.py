from django.test import TestCase
from django.core import mail
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from companies.models import Company
from applications.models import Application
from admin_api.email_broadcast import WHATSAPP_GROUP_LINK


class AdminBroadcastEmailTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin = User.objects.create_user(
            email="organizer@tkrcet.ac.in",
            password="adminpassword123",
            full_name="Placement Officer",
            role="admin",
            is_staff=True,
        )

        # Student users
        self.student1 = User.objects.create_user(
            email="student1@gmail.com",
            password="studentpass123",
            full_name="Rohit Sharma",
            role="student",
        )
        self.student2 = User.objects.create_user(
            email="student2@gmail.com",
            password="studentpass123",
            full_name="Pooja Hegde",
            role="student",
        )

        # Company and application for student1
        self.company = Company.objects.create(
            name="TechCorp India",
            sector="IT / Software",
            job_position="Software Engineer",
            salary_ctc="6 LPA",
        )
        Application.objects.create(student=self.student1, company=self.company)

    def test_unauthenticated_access_blocked(self):
        res = self.client.get("/api/admin/broadcast-email/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_access_forbidden(self):
        self.client.force_authenticate(user=self.student1)
        res = self.client.get("/api/admin/broadcast-email/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_get_stats(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get("/api/admin/broadcast-email/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data["total_registered_students"], 2)
        self.assertEqual(data["students_with_email"], 2)
        self.assertEqual(data["students_with_applications"], 1)
        self.assertEqual(data["admin_email"], self.admin.email)
        self.assertEqual(data["whatsapp_group_link"], WHATSAPP_GROUP_LINK)

    def test_admin_broadcast_validation(self):
        self.client.force_authenticate(user=self.admin)
        # Empty subject
        res = self.client.post(
            "/api/admin/broadcast-email/",
            {"subject": "", "message": "Valid body message text."},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Empty message
        res = self.client.post(
            "/api/admin/broadcast-email/",
            {"subject": "Valid Subject", "message": "   "},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_broadcast_to_all_students(self):
        mail.outbox = []
        self.client.force_authenticate(user=self.admin)

        payload = {
            "subject": "Important: Interview Timings & Documents Required",
            "message": "Please arrive at TKRCET campus by 8:30 AM with 3 hard copies of your resume.",
            "target": "all_students",
            "include_whatsapp": True,
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["sent_count"], 2)
        self.assertEqual(data["total_recipients"], 2)

        # Verify emails in test mail outbox
        self.assertEqual(len(mail.outbox), 2)
        recipients = [m.to[0] for m in mail.outbox]
        self.assertIn("student1@gmail.com", recipients)
        self.assertIn("student2@gmail.com", recipients)

        # Verify WhatsApp link is embedded in the message
        first_email = mail.outbox[0]
        self.assertIn(WHATSAPP_GROUP_LINK, first_email.body)

    def test_admin_broadcast_test_to_self(self):
        mail.outbox = []
        self.client.force_authenticate(user=self.admin)

        payload = {
            "subject": "Preview Test Notification",
            "message": "Testing out the email layout before blasting to candidates.",
            "target": "test_self",
            "include_whatsapp": True,
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["sent_count"], 1)

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.admin.email])

    def test_admin_broadcast_students_with_applications(self):
        mail.outbox = []
        self.client.force_authenticate(user=self.admin)

        payload = {
            "subject": "Notice for Candidates with Submitted Applications",
            "message": "Your applications have been forwarded to recruiters.",
            "target": "with_applications",
            "include_whatsapp": True,
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data["sent_count"], 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["student1@gmail.com"])
