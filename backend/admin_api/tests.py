from django.test import TestCase
from django.core import mail
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from companies.models import Company
from applications.models import Application
from admin_api.email_broadcast import WHATSAPP_CHANNEL_LINK


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
        self.assertEqual(data["whatsapp_channel_link"], WHATSAPP_CHANNEL_LINK)

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

        # Verify WhatsApp channel link is embedded in the message and no group link
        first_email = mail.outbox[0]
        self.assertNotIn("https://chat.whatsapp.com", first_email.body)
        self.assertIn(WHATSAPP_CHANNEL_LINK, first_email.body)

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

    def test_admin_broadcast_resumable_batches_and_no_duplicates(self):
        """
        Verify that broadcast emails can be safely dispatched in resumable batches
        with duplicate-send protection (already-sent recipients are never re-sent).
        """
        # Add 2 more students so total is 4
        User.objects.create_user(
            email="student3@gmail.com",
            password="pass",
            full_name="Third Student",
            role="student",
        )
        User.objects.create_user(
            email="student4@gmail.com",
            password="pass",
            full_name="Fourth Student",
            role="student",
        )

        mail.outbox = []
        self.client.force_authenticate(user=self.admin)

        # Dispatch Batch 1 of 2
        payload = {
            "subject": "Resumable Batch Test",
            "message": "Testing chunked delivery with duplicate protection.",
            "target": "all_students",
            "batch_size": 2,
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertFalse(data["is_completed"])
        self.assertEqual(data["sent_count"], 2)
        self.assertEqual(data["remaining_count"], 2)
        self.assertEqual(data["total_recipients"], 4)
        self.assertEqual(len(mail.outbox), 2)

        campaign_id = data["campaign_id"]
        first_batch_recipients = [m.to[0] for m in mail.outbox]

        # Reset outbox to inspect the second batch
        mail.outbox = []

        # Resume Campaign to send remaining batch
        resume_payload = {
            "action": "resume",
            "campaign_id": campaign_id,
            "batch_size": 2,
        }
        res2 = self.client.post("/api/admin/broadcast-email/", resume_payload, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        data2 = res2.json()
        self.assertTrue(data2["is_completed"])
        self.assertEqual(data2["sent_count"], 4)
        self.assertEqual(data2["remaining_count"], 0)
        self.assertEqual(len(mail.outbox), 2)

        second_batch_recipients = [m.to[0] for m in mail.outbox]

        # Verify NO duplicate recipients across batches
        for recipient in second_batch_recipients:
            self.assertNotIn(recipient, first_batch_recipients)

    def test_admin_broadcast_cancel_campaign(self):
        self.client.force_authenticate(user=self.admin)
        from admin_api.models import BroadcastCampaign

        campaign = BroadcastCampaign.objects.create(
            subject="Campaign to Cancel",
            message="Will be cancelled.",
            target="all_students",
            status="in_progress",
        )
        res = self.client.post(
            "/api/admin/broadcast-email/",
            {"action": "cancel", "campaign_id": campaign.id},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, "cancelled")

    def test_admin_broadcast_with_custom_limit(self):
        """
        Verify that admin can specify custom student count/limit so only that many emails are sent.
        """
        mail.outbox = []
        self.client.force_authenticate(user=self.admin)

        payload = {
            "subject": "Limited Announcement to First Student",
            "message": "Only sending to 1 student from starting.",
            "target": "all_students",
            "limit": 1,
            "start_from": 1,
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["sent_count"], 1)
        self.assertEqual(data["total_recipients"], 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["student1@gmail.com"])

    def test_admin_broadcast_with_start_from_and_limit(self):
        """
        Verify that admin can specify start_from to send from a specific candidate onwards.
        """
        mail.outbox = []
        self.client.force_authenticate(user=self.admin)

        payload = {
            "subject": "Announcement to Second Student",
            "message": "Starting from student #2, send 1 student.",
            "target": "all_students",
            "start_from": 2,
            "limit": 1,
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["sent_count"], 1)
        self.assertEqual(data["total_recipients"], 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["student2@gmail.com"])

    def test_admin_broadcast_limit_and_start_from_validations(self):
        """
        Verify input validations for limit and start_from.
        """
        self.client.force_authenticate(user=self.admin)

        # limit <= 0
        res = self.client.post(
            "/api/admin/broadcast-email/",
            {"subject": "Valid Subject", "message": "Valid Message Body", "limit": 0},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("limit", res.json()["error"])

        # start_from <= 0
        res = self.client.post(
            "/api/admin/broadcast-email/",
            {"subject": "Valid Subject", "message": "Valid Message Body", "start_from": 0},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("start_from", res.json()["error"])

        # start_from > total available
        res = self.client.post(
            "/api/admin/broadcast-email/",
            {"subject": "Valid Subject", "message": "Valid Message Body", "start_from": 9999},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("exceeds", res.json()["error"])

    def test_admin_broadcast_test_self_with_custom_test_email(self):
        """
        Verify that admin can dispatch a test email to a specific testing email address.
        """
        mail.outbox = []
        self.client.force_authenticate(user=self.admin)

        payload = {
            "subject": "Test Dispatch Subject",
            "message": "Testing email body with WhatsApp link.",
            "target": "test_self",
            "test_email": "vinaybyagari07@gmail.com",
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["test_email"], "vinaybyagari07@gmail.com")
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["vinaybyagari07@gmail.com"])
        self.assertIn("https://whatsapp.com/channel/0029Vb8b8zREawdobwEPqI3c", mail.outbox[0].body)

    def test_admin_broadcast_test_self_default_fallback_email(self):
        """
        Verify that admin test_self falls back to vinaybyagari07@gmail.com if no email is configured.
        """
        mail.outbox = []
        no_email_admin = User.objects.create_user(
            email="temp@placeholder.local",
            password="adminpassword123",
            full_name="No Email Admin",
            role="admin",
            is_staff=True,
        )
        User.objects.filter(id=no_email_admin.id).update(email="")
        no_email_admin.refresh_from_db()
        self.client.force_authenticate(user=no_email_admin)

        payload = {
            "subject": "Fallback Test Email",
            "message": "Testing fallback email address.",
            "target": "test_self",
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["test_email"], "vinaybyagari07@gmail.com")
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["vinaybyagari07@gmail.com"])

    def test_admin_broadcast_whatsapp_group_only(self):
        """
        Verify that WhatsApp group links are never included even if requested.
        """
        mail.outbox = []
        self.client.force_authenticate(user=self.admin)
        payload = {
            "subject": "WhatsApp Group Only Announcement",
            "message": "Only Group should be present.",
            "target": "test_self",
            "include_whatsapp_group": True,
            "include_whatsapp_channel": False,
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        body = mail.outbox[0].body
        self.assertNotIn("https://chat.whatsapp.com", body)
        self.assertNotIn("https://whatsapp.com/channel/0029Vb8b8zREawdobwEPqI3c", body)

    def test_admin_broadcast_whatsapp_channel_only(self):
        """
        Verify that admin can choose to include only the WhatsApp Channel link.
        """
        mail.outbox = []
        self.client.force_authenticate(user=self.admin)
        payload = {
            "subject": "WhatsApp Channel Only Announcement",
            "message": "Only Channel should be present.",
            "target": "test_self",
            "include_whatsapp_group": False,
            "include_whatsapp_channel": True,
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        body = mail.outbox[0].body
        self.assertNotIn("https://chat.whatsapp.com/Fq0JocusAOL1PyMi0oZtks", body)
        self.assertIn("https://whatsapp.com/channel/0029Vb8b8zREawdobwEPqI3c", body)

    def test_admin_broadcast_whatsapp_neither(self):
        """
        Verify that admin can opt out of both WhatsApp Group and WhatsApp Channel.
        """
        mail.outbox = []
        self.client.force_authenticate(user=self.admin)
        payload = {
            "subject": "No WhatsApp Links Announcement",
            "message": "Neither link should be included.",
            "target": "test_self",
            "include_whatsapp_group": False,
            "include_whatsapp_channel": False,
        }
        res = self.client.post("/api/admin/broadcast-email/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        body = mail.outbox[0].body
        self.assertNotIn("https://chat.whatsapp.com/Fq0JocusAOL1PyMi0oZtks", body)
        self.assertNotIn("https://whatsapp.com/channel/0029Vb8b8zREawdobwEPqI3c", body)


