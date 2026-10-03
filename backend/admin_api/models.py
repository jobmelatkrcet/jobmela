from django.db import models


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
