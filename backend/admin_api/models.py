from django.db import models
from django.conf import settings


class JobMelaRequirement(models.Model):
    CATEGORY_CHOICES = [
        ("documents", "Required Documents"),
        ("eligibility", "Eligibility Criteria"),
        ("instructions", "Reporting & Guidelines"),
        ("dress_code", "Dress Code"),
        ("general", "General Rules"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    category = models.CharField(
        max_length=50, choices=CATEGORY_CHOICES, default="documents"
    )
    is_mandatory = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Job Mela Requirement"
        verbose_name_plural = "Job Mela Requirements"

    def __str__(self):
        return self.title


class BroadcastCampaign(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("paused", "Paused"),
        ("cancelled", "Cancelled"),
        ("failed", "Failed"),
    ]
    TARGET_CHOICES = [
        ("all_students", "All Registered Students"),
        ("with_applications", "Students with Applications"),
        ("test_self", "Test Email to Self"),
    ]

    subject = models.CharField(max_length=255)
    message = models.TextField()
    target = models.CharField(max_length=50, choices=TARGET_CHOICES, default="all_students")
    include_whatsapp = models.BooleanField(default=True)
    include_whatsapp_group = models.BooleanField(default=True)
    include_whatsapp_channel = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    total_recipients = models.PositiveIntegerField(default=0)
    sent_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="broadcast_campaigns",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Broadcast Campaign"
        verbose_name_plural = "Broadcast Campaigns"

    def __str__(self):
        return f"{self.subject} ({self.status}) - {self.sent_count}/{self.total_recipients}"


class BroadcastRecipient(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("failed", "Failed"),
    ]

    campaign = models.ForeignKey(
        BroadcastCampaign,
        on_delete=models.CASCADE,
        related_name="recipients",
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="broadcast_receipts",
    )
    email = models.EmailField(max_length=255)
    full_name = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["campaign", "email"],
                name="unique_campaign_recipient_email",
            )
        ]
        indexes = [
            models.Index(fields=["campaign", "status"]),
        ]

    def __str__(self):
        return f"{self.campaign_id} - {self.email} - {self.status}"

