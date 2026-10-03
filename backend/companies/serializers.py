from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    has_applied = serializers.SerializerMethodField()
    assigned_room_id = serializers.IntegerField(source="assigned_room.id", read_only=True, allow_null=True)
    unique_room_token = serializers.CharField(source="assigned_room.unique_room_token", read_only=True, allow_null=True)
    qr_status = serializers.CharField(source="assigned_room.qr_status", read_only=True, allow_null=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "sector",
            "job_position",
            "openings",
            "salary_ctc",
            "qualification",
            "location",
            "gender",
            "eligibility",
            "facilities",
            "room_no",
            "assigned_room_id",
            "unique_room_token",
            "qr_status",
            "created_at",
            "updated_at",
            "has_applied",
        ]

    def get_has_applied(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            # We can check via prefetched/cached set or exists query
            user_applied_ids = self.context.get("user_applied_ids")
            if user_applied_ids is not None:
                return obj.id in user_applied_ids
            return obj.applications.filter(student=request.user).exists()
        return False
