from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from .models import Company
from .serializers import CompanySerializer
from applications.models import Application


class StandardResultsPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class CompanyListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        search_query = request.query_params.get("search", "").strip()
        queryset = Company.objects.all().order_by("name")

        if search_query:
            queryset = queryset.filter(name__icontains=search_query)

        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(queryset, request)

        user_applied_ids = set()
        if request.user.is_authenticated:
            user_applied_ids = set(
                Application.objects.filter(student=request.user).values_list(
                    "company_id", flat=True
                )
            )

        serializer_context = {
            "request": request,
            "user_applied_ids": user_applied_ids,
        }

        if page is not None:
            serializer = CompanySerializer(page, many=True, context=serializer_context)
            return paginator.get_paginated_response(serializer.data)

        serializer = CompanySerializer(queryset, many=True, context=serializer_context)
        return Response(serializer.data)


class CompanyDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            company = Company.objects.get(pk=pk)
        except Company.DoesNotExist:
            return Response(
                {"error": "Company not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user_applied_ids = set()
        if request.user.is_authenticated:
            user_applied_ids = set(
                Application.objects.filter(student=request.user).values_list(
                    "company_id", flat=True
                )
            )

        serializer = CompanySerializer(
            company,
            context={"request": request, "user_applied_ids": user_applied_ids},
        )
        return Response(serializer.data)
