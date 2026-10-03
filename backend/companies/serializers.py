from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ["id", "name", "created_at", "updated_at", "has_applied"]

    def get_has_applied(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            # We can check via prefetched/cached set or exists query
            user_applied_ids = self.context.get("user_applied_ids")
            if user_applied_ids is not None:
                return obj.id in user_applied_ids
            return obj.applications.filter(student=request.user).exists()
        return False
