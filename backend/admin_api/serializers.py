from rest_framework import serializers
from accounts.models import User
from companies.models import Company, Room, RoomCheckIn
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
            "registered_students_count",
        ]


class RoomSerializer(serializers.ModelSerializer):
    assigned_company_name = serializers.SerializerMethodField()
    assigned_company_id = serializers.SerializerMethodField()
    assigned_company_sector = serializers.SerializerMethodField()
    assigned_company_position = serializers.SerializerMethodField()
    checkins_count = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            "id",
            "room_number",
            "unique_room_token",
            "qr_status",
            "active",
            "assigned_company_id",
            "assigned_company_name",
            "assigned_company_sector",
            "assigned_company_position",
            "checkins_count",
            "created_at",
            "updated_at",
        ]

    def get_assigned_company_name(self, obj):
        comp = obj.companies.first()
        return comp.name if comp else None

    def get_assigned_company_id(self, obj):
        comp = obj.companies.first()
        return comp.id if comp else None

    def get_assigned_company_sector(self, obj):
        comp = obj.companies.first()
        return comp.sector if comp else None

    def get_assigned_company_position(self, obj):
        comp = obj.companies.first()
        return comp.job_position if comp else None

    def get_checkins_count(self, obj):
        return obj.checkins.count()



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

