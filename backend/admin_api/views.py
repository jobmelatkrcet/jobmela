import io
import re
from datetime import datetime
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from django.db import transaction
from django.db.models import Count, Q
from django.http import HttpResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser

from accounts.models import User
from companies.models import Company
from applications.models import Application
from .permissions import IsAdminUserRole
from .serializers import (
    AdminStudentListSerializer,
    AdminStudentDetailSerializer,
    AdminCompanyListSerializer,
    AdminCompanyStudentSerializer,
)


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_students = User.objects.filter(role="student").count()
        total_companies = Company.objects.count()
        total_applications = Application.objects.count()

        top_companies = (
            Company.objects.annotate(applicant_count=Count("applications"))
            .order_by("-applicant_count")[:6]
            .values("id", "name", "applicant_count")
        )

        recent_applications = (
            Application.objects.select_related("student", "company")
            .order_by("-applied_at")[:10]
        )
        recent_apps_data = [
            {
                "id": app.id,
                "student_name": app.student.full_name,
                "student_email": app.student.email,
                "company_name": app.company.name,
                "applied_at": app.applied_at.strftime("%d %b %Y, %I:%M %p"),
            }
            for app in recent_applications
        ]

        return Response(
            {
                "total_students": total_students,
                "total_companies": total_companies,
                "total_applications": total_applications,
                "top_companies": list(top_companies),
                "recent_applications": recent_apps_data,
            }
        )


class AdminStudentsListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        search_query = request.query_params.get("search", "").strip()
        queryset = (
            User.objects.filter(role="student")
            .annotate(applications_count=Count("applications"))
            .order_by("-created_at")
        )

        if search_query:
            queryset = queryset.filter(
                Q(full_name__icontains=search_query)
                | Q(email__icontains=search_query)
                | Q(mobile__icontains=search_query)
                | Q(qualification__icontains=search_query)
                | Q(college__icontains=search_query)
            )

        paginator = AdminPagination()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = AdminStudentListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = AdminStudentListSerializer(queryset, many=True)
        return Response(serializer.data)


class AdminStudentDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            student = (
                User.objects.filter(role="student")
                .prefetch_related("applications__company")
                .annotate(applications_count=Count("applications"))
                .get(pk=pk)
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Student not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminStudentDetailSerializer(student)
        return Response(serializer.data)


class AdminCompaniesListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        search_query = request.query_params.get("search", "").strip()
        order_by = request.query_params.get("order", "name")

        queryset = Company.objects.annotate(
            registered_students_count=Count("applications")
        )

        if search_query:
            queryset = queryset.filter(name__icontains=search_query)

        if order_by == "applications_desc":
            queryset = queryset.order_by("-registered_students_count", "name")
        elif order_by == "applications_asc":
            queryset = queryset.order_by("registered_students_count", "name")
        else:
            queryset = queryset.order_by("name")

        paginator = AdminPagination()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = AdminCompanyListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = AdminCompanyListSerializer(queryset, many=True)
        return Response(serializer.data)


class AdminCompanyDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            company = Company.objects.annotate(
                registered_students_count=Count("applications")
            ).get(pk=pk)
        except Company.DoesNotExist:
            return Response(
                {"error": "Company not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminCompanyListSerializer(company)
        return Response(serializer.data)


class AdminCompanyStudentsListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            company = Company.objects.annotate(
                registered_students_count=Count("applications")
            ).get(pk=pk)
        except Company.DoesNotExist:
            return Response(
                {"error": "Company not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        search_query = request.query_params.get("search", "").strip()
        applications = (
            Application.objects.filter(company=company)
            .select_related("student")
            .order_by("-applied_at")
        )

        if search_query:
            applications = applications.filter(
                Q(student__full_name__icontains=search_query)
                | Q(student__email__icontains=search_query)
                | Q(student__mobile__icontains=search_query)
                | Q(student__qualification__icontains=search_query)
                | Q(student__college__icontains=search_query)
            )

        paginator = AdminPagination()
        page = paginator.paginate_queryset(applications, request)

        if page is not None:
            serializer = AdminCompanyStudentSerializer(page, many=True)
            response = paginator.get_paginated_response(serializer.data)
            # Add company metadata
            response.data["company"] = {
                "id": company.id,
                "name": company.name,
                "total_registered": company.registered_students_count,
            }
            return response

        serializer = AdminCompanyStudentSerializer(applications, many=True)
        return Response(
            {
                "company": {
                    "id": company.id,
                    "name": company.name,
                    "total_registered": company.registered_students_count,
                },
                "results": serializer.data,
            }
        )


class AdminCompanyExcelExportView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            company = Company.objects.get(pk=pk)
        except Company.DoesNotExist:
            return Response(
                {"error": "Company not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get all applications for this company ONLY
        applications = (
            Application.objects.filter(company=company)
            .select_related("student")
            .order_by("applied_at")
        )

        # Generate styled Excel workbook using openpyxl
        wb = Workbook()
        ws = wb.active
        ws.title = "Registered Students"

        # Theme styles
        navy_header = PatternFill(
            start_color="1E3A8A", end_color="1E3A8A", fill_type="solid"
        )
        accent_fill = PatternFill(
            start_color="F1F5F9", end_color="F1F5F9", fill_type="solid"
        )
        white_bold_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
        title_font = Font(name="Arial", size=15, bold=True, color="1E3A8A")
        sub_font = Font(name="Arial", size=11, bold=True, color="475569")
        data_font = Font(name="Arial", size=10)
        thin_side = Side(border_style="thin", color="CBD5E1")
        cell_border = Border(
            left=thin_side, right=thin_side, top=thin_side, bottom=thin_side
        )

        # Header rows
        ws.merge_cells("A1:G1")
        ws["A1"] = "TKR COLLEGE OF ENGINEERING & TECHNOLOGY — JOB MELA 2026"
        ws["A1"].font = title_font
        ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
        ws.row_dimensions[1].height = 28

        ws.merge_cells("A2:G2")
        ws["A2"] = (
            f"Participating Company: {company.name.upper()} | Total Registered Students: {applications.count()}"
        )
        ws["A2"].font = sub_font
        ws["A2"].alignment = Alignment(horizontal="center", vertical="center")
        ws.row_dimensions[2].height = 20

        ws.merge_cells("A3:G3")
        ws["A3"] = (
            f"Report Generated: {datetime.now().strftime('%d-%m-%Y %I:%M %p')} | Venue: TKRCET Campus"
        )
        ws["A3"].font = Font(name="Arial", size=9, italic=True, color="64748B")
        ws["A3"].alignment = Alignment(horizontal="center", vertical="center")
        ws.row_dimensions[3].height = 18

        # Blank row 4
        ws.row_dimensions[4].height = 8

        # Table Column Headers
        headers = [
            "S.No",
            "Name",
            "Email",
            "Mobile",
            "Qualification",
            "College",
            "Applied Date",
        ]
        ws.row_dimensions[5].height = 26

        for col_idx, header in enumerate(headers, start=1):
            cell = ws.cell(row=5, column=col_idx, value=header)
            cell.font = white_bold_font
            cell.fill = navy_header
            cell.alignment = Alignment(
                horizontal="center" if col_idx in (1, 4, 7) else "left",
                vertical="center",
            )
            cell.border = cell_border

        # Populate rows
        for row_idx, app in enumerate(applications, start=1):
            current_row = 5 + row_idx
            ws.row_dimensions[current_row].height = 20
            student = app.student

            row_data = [
                row_idx,
                student.full_name or "N/A",
                student.email or "N/A",
                student.mobile or "N/A",
                student.qualification or "N/A",
                student.college or "N/A",
                app.applied_at.strftime("%d-%m-%Y %I:%M %p"),
            ]

            fill = accent_fill if row_idx % 2 == 0 else PatternFill(fill_type=None)

            for col_idx, val in enumerate(row_data, start=1):
                cell = ws.cell(row=current_row, column=col_idx, value=val)
                cell.font = data_font
                cell.border = cell_border
                if fill.fill_type:
                    cell.fill = fill
                cell.alignment = Alignment(
                    horizontal="center" if col_idx in (1, 4, 7) else "left",
                    vertical="center",
                )

        # Auto-adjust column widths
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            # Skip checking merged title rows 1..3 for width calc
            for cell in col[4:]:
                if cell.value:
                    max_len = max(max_len, len(str(cell.value)))
            header_cell = ws.cell(row=5, column=col[0].column)
            header_len = len(str(header_cell.value or ""))
            ws.column_dimensions[col_letter].width = max(max_len + 4, header_len + 4, 12)

        # Write to byte stream
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        # Sanitize filename
        clean_company_name = re.sub(r"[^a-zA-Z0-9_\-]", "_", company.name).strip("_")
        filename = f"{clean_company_name}_Registered_Students.xlsx"

        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response["Access-Control-Expose-Headers"] = "Content-Disposition"
        return response


class AdminCompanyExcelUploadView(APIView):
    permission_classes = [IsAdminUserRole]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"error": "No file uploaded. Please select an Excel file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file extension
        filename = uploaded_file.name.lower()
        if not (filename.endswith(".xlsx") or filename.endswith(".xls")):
            return Response(
                {
                    "error": "Invalid file type. Only Excel files (.xlsx, .xls) are allowed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            wb = load_workbook(uploaded_file, data_only=True)
            ws = wb.active
        except Exception as e:
            return Response(
                {
                    "error": f"Failed to read the Excel file. Please ensure it is a valid Excel spreadsheet. ({str(e)})"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Extract company names
        # Format can be:
        # Row 1: S.No | Company Name (or Company)
        # OR Single column: Company Name
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return Response(
                {"error": "The uploaded Excel file is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find which column contains the company name
        first_row = [str(c).strip().lower() if c is not None else "" for c in rows[0]]
        company_col_idx = None
        has_header = False

        for idx, col_val in enumerate(first_row):
            if "company" in col_val or "name" in col_val or "organization" in col_val:
                company_col_idx = idx
                has_header = True
                break

        # If header wasn't explicitly found, infer:
        # If row has 2 columns and 1st is number/S.No, col 1 is company name
        if company_col_idx is None:
            if len(first_row) >= 2:
                # check if first cell is S.No or digit
                if first_row[0] in ("s.no", "sno", "sl.no", "#", "id", "1"):
                    company_col_idx = 1
                    has_header = not first_row[0].isdigit()
                else:
                    company_col_idx = 0
            else:
                company_col_idx = 0

        start_row = 1 if has_header else 0

        clear_existing = str(request.data.get("clear_existing", "false")).lower() in (
            "true",
            "1",
            "yes",
        )

        total_rows_processed = 0
        new_companies = 0
        existing_companies = 0
        duplicates_ignored = 0
        invalid_rows = 0

        with transaction.atomic():
            if clear_existing:
                Company.objects.all().delete()
                existing_db_companies = {}
            else:
                # Existing companies in DB mapped lower -> Company
                existing_db_companies = {
                    c.name.strip().lower(): c for c in Company.objects.all()
                }
            seen_in_batch = set()
            companies_to_create = []
            for row in rows[start_row:]:
                if not row or len(row) <= company_col_idx:
                    continue

                cell_value = row[company_col_idx]
                if cell_value is None:
                    continue

                company_name = str(cell_value).strip()
                if not company_name:
                    continue

                total_rows_processed += 1
                norm_name = company_name.lower()

                # Check duplicate within this uploaded file
                if norm_name in seen_in_batch:
                    duplicates_ignored += 1
                    continue
                seen_in_batch.add(norm_name)

                # Check if exists in DB
                if norm_name in existing_db_companies:
                    existing_companies += 1
                else:
                    companies_to_create.append(Company(name=company_name))
                    new_companies += 1

            if companies_to_create:
                Company.objects.bulk_create(companies_to_create)

        return Response(
            {
                "message": (
                    f"Successfully cleared pre-existing companies and imported {new_companies} new companies."
                    if clear_existing
                    else f"Successfully imported {new_companies} companies."
                ),
                "total_rows": total_rows_processed,
                "new_companies": new_companies,
                "existing_companies": existing_companies,
                "duplicates_ignored": duplicates_ignored,
                "invalid_rows": invalid_rows,
                "cleared_existing": clear_existing,
            },
            status=status.HTTP_200_OK,
        )


class AdminCompanyClearAllView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        with transaction.atomic():
            count, _ = Company.objects.all().delete()
        return Response(
            {"message": f"Successfully cleared all {count} companies.", "deleted": count},
            status=status.HTTP_200_OK,
        )


class AdminCompanyTemplateDownloadView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        wb = Workbook()
        ws = wb.active
        ws.title = "Company List Template"

        # Headers
        ws.cell(row=1, column=1, value="S.No")
        ws.cell(row=1, column=2, value="Company Name")

        # Styling
        header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(
            start_color="1E3A8A", end_color="1E3A8A", fill_type="solid"
        )
        for col_idx in (1, 2):
            cell = ws.cell(row=1, column=col_idx)
            cell.font = header_font
            cell.fill = header_fill

        # Sample rows
        sample_companies = [
            (1, "Tata Consultancy Services (TCS)"),
            (2, "Infosys"),
            (3, "HCLTech"),
            (4, "Wipro"),
            (5, "Tech Mahindra"),
        ]
        for row_idx, (sno, comp_name) in enumerate(sample_companies, start=2):
            ws.cell(row=row_idx, column=1, value=sno)
            ws.cell(row=row_idx, column=2, value=comp_name)

        ws.column_dimensions["A"].width = 10
        ws.column_dimensions["B"].width = 40

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = (
            'attachment; filename="Company_Upload_Template.xlsx"'
        )
        return response


from rest_framework.permissions import AllowAny
from .models import JobMelaRequirement
from .serializers import JobMelaRequirementSerializer


class JobMelaRequirementsPublicListView(APIView):
    """Public / Student endpoint to view all active Job Mela requirements."""

    permission_classes = [AllowAny]

    def get(self, request):
        requirements = JobMelaRequirement.objects.all().order_by("order", "id")
        serializer = JobMelaRequirementSerializer(requirements, many=True)
        return Response(
            {"requirements": serializer.data, "count": requirements.count()}
        )


class AdminJobMelaRequirementListCreateView(APIView):
    """Admin endpoint to list and create Job Mela requirements."""

    permission_classes = [IsAdminUserRole]

    def get(self, request):
        requirements = JobMelaRequirement.objects.all().order_by("order", "id")
        serializer = JobMelaRequirementSerializer(requirements, many=True)
        return Response(
            {"requirements": serializer.data, "count": requirements.count()}
        )

    def post(self, request):
        serializer = JobMelaRequirementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminJobMelaRequirementDetailView(APIView):
    """Admin endpoint to retrieve, update, and delete a Job Mela requirement."""

    permission_classes = [IsAdminUserRole]

    def get_object(self, pk):
        try:
            return JobMelaRequirement.objects.get(pk=pk)
        except JobMelaRequirement.DoesNotExist:
            return None

    def get(self, request, pk):
        req = self.get_object(pk)
        if not req:
            return Response(
                {"error": "Requirement not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = JobMelaRequirementSerializer(req)
        return Response(serializer.data)

    def put(self, request, pk):
        req = self.get_object(pk)
        if not req:
            return Response(
                {"error": "Requirement not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = JobMelaRequirementSerializer(req, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        req = self.get_object(pk)
        if not req:
            return Response(
                {"error": "Requirement not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        req.delete()
        return Response(
            {"message": "Requirement deleted successfully."},
            status=status.HTTP_200_OK,
        )

