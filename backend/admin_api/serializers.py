from rest_framework import serializers
from accounts.models import User
from companies.models import Company
from applications.models import Application


class AdminStudentListSerializer(serializers.ModelSerializer):
    applications_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "mobile",
            "qualification",
            "college",
            "applications_count",
            "created_at",
        ]


class AdminApplicationBriefSerializer(serializers.ModelSerializer):
    company_id = serializers.IntegerField(source="company.id", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Application
        fields = ["id", "company_id", "company_name", "applied_at"]


class AdminStudentDetailSerializer(serializers.ModelSerializer):
    applications = AdminApplicationBriefSerializer(many=True, read_only=True)
    applications_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "mobile",
            "qualification",
            "college",
            "created_at",
            "applications_count",
            "applications",
        ]


class AdminCompanyListSerializer(serializers.ModelSerializer):
    registered_students_count = serializers.IntegerField(read_only=True)

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
            "created_at",
            "updated_at",
            "registered_students_count",
        ]


class AdminCompanyStudentSerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(source="student.id", read_only=True)
    name = serializers.CharField(source="student.full_name", read_only=True)
    email = serializers.CharField(source="student.email", read_only=True)
    mobile = serializers.CharField(source="student.mobile", read_only=True)
    qualification = serializers.CharField(
        source="student.qualification", read_only=True
    )
    college = serializers.CharField(source="student.college", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "student_id",
            "name",
            "email",
            "mobile",
            "qualification",
            "college",
            "applied_at",
        ]


from .models import JobMelaRequirement


class JobMelaRequirementSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )

    class Meta:
        model = JobMelaRequirement
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_display",
            "is_mandatory",
            "order",
            "created_at",
            "updated_at",
        ]

