import uuid
from django.conf import settings
from django.db import models


class Room(models.Model):
    QR_STATUS_CHOICES = (
        ("active", "Active"),
        ("inactive", "Inactive"),
    )

    room_number = models.CharField(max_length=100, unique=True, db_index=True)
    unique_room_token = models.CharField(
        max_length=64, unique=True, db_index=True, blank=True
    )
    qr_status = models.CharField(
        max_length=20, choices=QR_STATUS_CHOICES, default="active"
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["room_number"]

    def save(self, *args, **kwargs):
        if not self.unique_room_token:
            clean_num = "".join(c for c in self.room_number if c.isalnum())
            self.unique_room_token = f"RM_{clean_num}_{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Room {self.room_number}"


class Company(models.Model):
    name = models.CharField(max_length=255, db_index=True)
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
    assigned_room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="companies",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ["id"]

    def __str__(self):
        return self.name


class RoomCheckIn(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="room_checkins",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="checkins",
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="checkins",
    )
    checked_in_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-checked_in_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "room"],
                name="unique_student_room_checkin",
            )
        ]

    def __str__(self):
        return f"{self.student.full_name} -> {self.room.room_number}"
