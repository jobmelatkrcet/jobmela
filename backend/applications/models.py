from django.conf import settings
from django.db import models
from companies.models import Company


class Application(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    applied_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "company"],
                name="unique_student_company_application",
            )
        ]
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.student.full_name} -> {self.company.name}"
