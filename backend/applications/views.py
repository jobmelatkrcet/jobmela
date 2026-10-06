from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
from .models import Application
from .serializers import ApplicationSerializer, ApplySerializer
from companies.models import Company, RoomCheckIn


class ApplyCompanyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ApplySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        company_id = serializer.validated_data["company_id"]
        company = Company.objects.get(id=company_id)

        # Check existing application
        if Application.objects.filter(student=request.user, company=company).exists():
            return Response(
                {"error": f"You have already applied for {company.name}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            application = Application.objects.create(
                student=request.user, company=company
            )
            return Response(
                {
                    "message": f"Application Successful for {company.name}!",
                    "application": ApplicationSerializer(application).data,
                },
                status=status.HTTP_201_CREATED,
            )
        except IntegrityError:
            return Response(
                {"error": f"You have already applied for {company.name}."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MyApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = Application.objects.filter(student=request.user).select_related(
            "company"
        ).order_by("-applied_at")

        serializer = ApplicationSerializer(applications, many=True)
        return Response(
            {
                "total_applied": applications.count(),
                "applications": serializer.data,
            }
        )


class StudentStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_companies = Company.objects.count()
        applied_count = Application.objects.filter(student=request.user).count()
        attempted_count = RoomCheckIn.objects.filter(student=request.user).count()

        return Response(
            {
                "total_companies": total_companies,
                "applied_count": applied_count,
                "attempted_count": attempted_count,
                "max_attempts": 3,
                "remaining_attempts": max(0, 3 - attempted_count),
            }
        )
