from django.db import models


class Company(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    sector = models.CharField(max_length=255, blank=True, default="")
    job_position = models.CharField(max_length=255, blank=True, default="")
    openings = models.CharField(max_length=100, blank=True, default="")
    salary_ctc = models.CharField(max_length=255, blank=True, default="")
    qualification = models.TextField(blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    gender = models.CharField(max_length=100, blank=True, default="")
    eligibility = models.TextField(blank=True, default="")
    facilities = models.TextField(blank=True, default="")
    room_no = models.CharField(max_length=100, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ["name"]

    def __str__(self):
        return self.name
