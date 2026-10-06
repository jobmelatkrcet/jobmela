from django.db.models import Q
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
    max_page_size = 500


class CompanyListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        search_query = request.query_params.get("search", "").strip()
        qualification_filter = request.query_params.get("qualification", "").strip()
        queryset = Company.objects.all().order_by("name")

        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(sector__icontains=search_query)
                | Q(job_position__icontains=search_query)
                | Q(location__icontains=search_query)
                | Q(qualification__icontains=search_query)
                | Q(room_no__icontains=search_query)
            )

        if qualification_filter and qualification_filter.lower() != "all":
            q_lower = qualification_filter.lower()
            if q_lower in ["btech", "be", "engineering", "b.tech", "b.tech / b.e"]:
                queryset = queryset.filter(
                    Q(qualification__icontains="btech")
                    | Q(qualification__icontains="b.tech")
                    | Q(qualification__icontains="b tech")
                    | Q(qualification__icontains="be")
                    | Q(qualification__icontains="b.e")
                    | Q(qualification__icontains="engineering")
                    | Q(qualification__icontains="any degree")
                    | Q(qualification__icontains="any graduation")
                    | Q(qualification__icontains="any graduate")
                )
            elif q_lower in ["degree", "graduation", "graduate", "degree / graduation"]:
                queryset = queryset.filter(
                    Q(qualification__icontains="degree")
                    | Q(qualification__icontains="graduation")
                    | Q(qualification__icontains="graduate")
                    | Q(qualification__icontains="bsc")
                    | Q(qualification__icontains="b.sc")
                    | Q(qualification__icontains="bcom")
                    | Q(qualification__icontains="b.com")
                    | Q(qualification__icontains="bba")
                    | Q(qualification__icontains="bca")
                    | Q(qualification__icontains="ba")
                )
            elif q_lower in ["diploma", "polytechnic"]:
                queryset = queryset.filter(
                    Q(qualification__icontains="diploma")
                    | Q(qualification__icontains="polytechnic")
                )
            elif q_lower in ["mba", "mca", "pg", "pg_mba", "post graduation", "mba / pg"]:
                queryset = queryset.filter(
                    Q(qualification__icontains="mba")
                    | Q(qualification__icontains="mca")
                    | Q(qualification__icontains="msc")
                    | Q(qualification__icontains="m.tech")
                    | Q(qualification__icontains="post graduation")
                    | Q(qualification__icontains="pg")
                )
            elif q_lower in ["inter", "iti", "ssc", "10th", "10th_inter", "inter_iti", "10th / inter / iti"]:
                queryset = queryset.filter(
                    Q(qualification__icontains="inter")
                    | Q(qualification__icontains="iti")
                    | Q(qualification__icontains="ssc")
                    | Q(qualification__icontains="10")
                    | Q(qualification__icontains="12th")
                )
            else:
                queryset = queryset.filter(Q(qualification__icontains=qualification_filter))

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
