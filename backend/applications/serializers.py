from rest_framework import serializers
from .models import Application
from companies.models import Company
from companies.serializers import CompanySerializer


class ApplicationSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Application
        fields = ["id", "company", "company_name", "applied_at"]


class ApplySerializer(serializers.Serializer):
    company_id = serializers.IntegerField(required=True)

    def validate_company_id(self, value):
        try:
            company = Company.objects.get(id=value)
        except Company.DoesNotExist:
            raise serializers.ValidationError("Company does not exist.")
        return value
