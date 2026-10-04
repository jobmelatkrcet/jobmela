import io
import re
from datetime import datetime
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from django.conf import settings
from django.db import transaction
from django.db.models import Count, Q
from django.http import HttpResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser

import base64
import qrcode
from accounts.models import User
from companies.models import Company, Room, RoomCheckIn
from applications.models import Application
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsAdminUserRole
from .serializers import (
    AdminStudentListSerializer,
    AdminStudentDetailSerializer,
    AdminCompanyListSerializer,
    AdminCompanyStudentSerializer,
    RoomSerializer,
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
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(sector__icontains=search_query)
                | Q(job_position__icontains=search_query)
                | Q(location__icontains=search_query)
                | Q(qualification__icontains=search_query)
                | Q(room_no__icontains=search_query)
            )

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
            "Resume Uploaded",
            "Applied Date",
        ]
        ws.row_dimensions[5].height = 26

        for col_idx, header in enumerate(headers, start=1):
            cell = ws.cell(row=5, column=col_idx, value=header)
            cell.font = white_bold_font
            cell.fill = navy_header
            cell.alignment = Alignment(
                horizontal="center" if col_idx in (1, 4, 7, 8) else "left",
                vertical="center",
            )
            cell.border = cell_border

        # Populate rows
        for row_idx, app in enumerate(applications, start=1):
            current_row = 5 + row_idx
            ws.row_dimensions[current_row].height = 20
            student = app.student
            resume_status = "Available (Uploaded)" if student.resume else "Not Uploaded"

            row_data = [
                row_idx,
                student.full_name or "N/A",
                student.email or "N/A",
                student.mobile or "N/A",
                student.qualification or "N/A",
                student.college or "N/A",
                resume_status,
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


def normalize_header_text(header_val):
    if header_val is None:
        return ""
    s = str(header_val).strip().lower()
    s = re.sub(r"[._/\\()#:\-]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def normalize_company_name_key(name: str) -> str:
    if not name:
        return ""
    s = str(name).lower().strip()
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\bprivate\s+limited\b", " ", s)
    s = re.sub(r"\bpvt\s+ltd\b", " ", s)
    s = re.sub(r"\bpvt\b", " ", s)
    s = re.sub(r"\blimited\b", " ", s)
    s = re.sub(r"\bltd\b", " ", s)
    s = re.sub(r"\bcorporation\b", " ", s)
    s = re.sub(r"\bcorp\b", " ", s)
    s = re.sub(r"\btechnologies\b", " ", s)
    s = re.sub(r"\btechnology\b", " ", s)
    s = re.sub(r"\bsolutions\b", " ", s)
    s = re.sub(r"\bservices\b", " ", s)
    s = re.sub(r"\binc\b", " ", s)
    s = re.sub(r"\bllc\b", " ", s)
    return re.sub(r"\s+", "", s)


def get_company_lookup_keys(name: str):
    keys = set()
    raw = str(name).strip()
    if not raw:
        return keys
    k_main = normalize_company_name_key(raw)
    if k_main:
        keys.add(k_main)
    without_parens = re.sub(r"\(.*?\)", " ", raw)
    k_no_parens = normalize_company_name_key(without_parens)
    if k_no_parens:
        keys.add(k_no_parens)
    for p in re.findall(r"\((.*?)\)", raw):
        kp = normalize_company_name_key(p)
        if kp:
            keys.add(kp)
    return keys


INVALID_CELL_VALUES = {
    "",
    "-",
    "--",
    "---",
    "n/a",
    "na",
    "n.a.",
    "nil",
    "none",
    "null",
    "nan",
    "not available",
    "unknown",
}


def clean_cell_text(val):
    if val is None:
        return ""
    if isinstance(val, float) and val.is_integer():
        val = int(val)
    s = str(val).strip()
    if s.lower() in INVALID_CELL_VALUES:
        return ""
    return s


FIELD_HEADER_PATTERNS = {
    "name": [
        "company name",
        "company_name",
        "company",
        "organization name",
        "organisation name",
        "organization",
        "organisation",
        "employer",
        "recruiter",
        "client",
        "firm",
        "name of the company",
        "name of company",
        "companyname",
    ],
    "sector": [
        "sector",
        "industry",
        "domain",
        "business sector",
        "industry sector",
        "company sector",
        "category",
    ],
    "job_position": [
        "job position",
        "job title",
        "position",
        "job role",
        "role",
        "designation",
        "profile",
        "job profile",
        "post",
        "job post",
        "title",
    ],
    "openings": [
        "openings",
        "opening",
        "no of openings",
        "number of openings",
        "vacancies",
        "vacancy",
        "no of vacancies",
        "number of vacancies",
        "total openings",
        "total vacancies",
        "no of posts",
        "number of posts",
        "seats",
    ],
    "salary_ctc": [
        "salary",
        "ctc",
        "salary ctc",
        "salary/ctc",
        "package",
        "annual package",
        "stipend",
        "remuneration",
        "pay",
        "lpa",
        "compensation",
        "fixed ctc",
        "take home",
    ],
    "qualification": [
        "qualification",
        "qualifications",
        "degree",
        "education",
        "educational qualification",
        "eligible branch",
        "eligible branches",
        "branch",
        "branches",
        "course",
        "courses",
        "eligible course",
        "stream",
        "specialization",
    ],
    "location": [
        "location",
        "job location",
        "work location",
        "place of posting",
        "posting location",
        "city",
        "job city",
        "workplace",
        "base location",
        "office location",
        "posting",
    ],
    "gender": [
        "gender",
        "gender criteria",
        "gender preference",
        "sex",
        "eligible gender",
        "male female",
    ],
    "eligibility": [
        "eligibility",
        "eligibility criteria",
        "criteria",
        "percentage",
        "cutoff",
        "cut off",
        "aggregate",
        "min percentage",
        "minimum percentage",
        "cgpa",
        "backlogs",
        "active backlogs",
        "academic criteria",
    ],
    "facilities": [
        "facilities",
        "facility",
        "perks",
        "benefits",
        "other benefits",
        "perks benefits",
        "accommodation",
        "transport",
        "food",
        "allowance",
        "allowances",
    ],
    "room_no": [
        "room",
        "room no",
        "room number",
        "venue",
        "cabin",
        "interview room",
        "desk",
        "stall",
        "stall no",
        "stall number",
        "table",
        "table no",
        "interview venue",
        "room details",
    ],
}

FIELD_DISPLAY_LABELS = {
    "name": "Company Name",
    "sector": "Sector",
    "job_position": "Job Position",
    "openings": "Openings",
    "salary_ctc": "Salary / CTC",
    "qualification": "Qualification",
    "location": "Location",
    "gender": "Gender",
    "eligibility": "Eligibility",
    "facilities": "Facilities",
    "room_no": "Room No.",
}


def identify_header_and_mappings(rows):
    best_header_row_idx = 0
    best_mappings = {}
    best_field_count = 0
    has_name_in_best = False

    for row_idx, row in enumerate(rows[:6]):
        if not row:
            continue
        mappings = {}
        used_fields = set()

        for col_idx, cell in enumerate(row):
            norm_header = normalize_header_text(cell)
            if not norm_header:
                continue

            if norm_header in (
                "s no",
                "sno",
                "sl no",
                "slno",
                "sr no",
                "srno",
                "id",
                "serial no",
                "no",
            ):
                continue

            matched_field = None
            if norm_header == "name":
                matched_field = "name"
            else:
                for field_name, patterns in FIELD_HEADER_PATTERNS.items():
                    if field_name in used_fields:
                        continue
                    for pat in patterns:
                        if (
                            norm_header == pat
                            or norm_header.startswith(pat + " ")
                            or norm_header.endswith(" " + pat)
                            or pat in norm_header
                        ):
                            matched_field = field_name
                            break
                    if matched_field:
                        break

            if matched_field and matched_field not in used_fields:
                mappings[col_idx] = matched_field
                used_fields.add(matched_field)

        has_name = "name" in used_fields
        field_count = len(used_fields)

        if has_name and (not has_name_in_best or field_count > best_field_count):
            best_header_row_idx = row_idx
            best_mappings = mappings
            best_field_count = field_count
            has_name_in_best = True
        elif not has_name_in_best and field_count > best_field_count:
            best_header_row_idx = row_idx
            best_mappings = mappings
            best_field_count = field_count

    if "name" not in best_mappings.values():
        first_row = rows[0] if rows else []
        if len(first_row) >= 2:
            first_cell_str = str(first_row[0] or "").strip().lower()
            if (
                first_cell_str in ("s.no", "sno", "1", "sl.no", "#")
                or first_cell_str.isdigit()
            ):
                best_mappings[1] = "name"
                best_header_row_idx = 1 if not first_cell_str.isdigit() else 0
            else:
                best_mappings[0] = "name"
                best_header_row_idx = 0
        else:
            best_mappings[0] = "name"
            best_header_row_idx = 0

    return best_header_row_idx, best_mappings


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

        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return Response(
                {"error": "The uploaded Excel file is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        header_row_idx, col_mappings = identify_header_and_mappings(rows)
        start_row = header_row_idx + 1

        is_preview = (
            str(request.data.get("preview", "false")).lower() in ("true", "1", "yes")
            or request.query_params.get("preview", "").lower() in ("true", "1", "yes")
        )

        detected_columns = [
            FIELD_DISPLAY_LABELS.get(f, f) for f in col_mappings.values()
        ]

        if is_preview:
            exact_lower_map = {}
            norm_key_map = {}
            for c in Company.objects.all():
                clean_name = c.name.strip()
                exact_lower_map[clean_name.lower()] = c.name
                for k in get_company_lookup_keys(clean_name):
                    norm_key_map[k] = c.name

            preview_companies = []
            duplicate_matches = []
            seen_in_file = set()
            invalid_count = 0
            sample_rows = []

            for row in rows[start_row:]:
                if not row or not any(c is not None and str(c).strip() for c in row):
                    continue

                row_data = {}
                for col_idx, field_name in col_mappings.items():
                    if col_idx < len(row):
                        cell_val = clean_cell_text(row[col_idx])
                        if cell_val:
                            row_data[field_name] = cell_val

                company_name = row_data.get("name", "").strip()
                if not company_name:
                    invalid_count += 1
                    continue

                norm_lower = company_name.lower()
                existing_match = exact_lower_map.get(norm_lower)
                if not existing_match:
                    for k in get_company_lookup_keys(company_name):
                        if k in norm_key_map:
                            existing_match = norm_key_map[k]
                            break

                if existing_match:
                    if existing_match not in duplicate_matches:
                        duplicate_matches.append(existing_match)
                elif norm_lower in seen_in_file:
                    if company_name not in duplicate_matches:
                        duplicate_matches.append(company_name)

                seen_in_file.add(norm_lower)
                preview_companies.append(company_name)
                if len(sample_rows) < 5:
                    sample_rows.append(row_data)

            return Response(
                {
                    "preview": True,
                    "filename": uploaded_file.name,
                    "total_rows": len(preview_companies) + invalid_count,
                    "companies_detected": len(preview_companies),
                    "invalid_rows": invalid_count,
                    "columns_detected": detected_columns,
                    "possible_duplicates_count": len(duplicate_matches),
                    "possible_duplicates": duplicate_matches[:10],
                    "sample_rows": sample_rows,
                },
                status=status.HTTP_200_OK,
            )

        clear_existing = str(request.data.get("clear_existing", "false")).lower() in (
            "true",
            "1",
            "yes",
        )

        total_rows_processed = 0
        new_companies = 0
        updated_companies = 0
        existing_unchanged = 0
        invalid_rows = 0

        exact_lower_map = {}
        norm_key_map = {}

        with transaction.atomic():
            if clear_existing:
                Company.objects.all().delete()
            else:
                for c in Company.objects.all():
                    clean_name = c.name.strip()
                    exact_lower_map[clean_name.lower()] = c
                    for k in get_company_lookup_keys(clean_name):
                        norm_key_map[k] = c

            for row in rows[start_row:]:
                if not row or not any(c is not None and str(c).strip() for c in row):
                    continue

                row_data = {}
                for col_idx, field_name in col_mappings.items():
                    if col_idx < len(row):
                        cell_val = clean_cell_text(row[col_idx])
                        if cell_val:
                            row_data[field_name] = cell_val

                company_name = row_data.get("name", "").strip()
                if not company_name:
                    invalid_rows += 1
                    continue

                total_rows_processed += 1
                norm_lower = company_name.lower()

                existing_company = exact_lower_map.get(norm_lower)
                if not existing_company:
                    for k in get_company_lookup_keys(company_name):
                        if k in norm_key_map:
                            existing_company = norm_key_map[k]
                            break

                if existing_company:
                    is_changed = False
                    for f in [
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
                    ]:
                        new_val = row_data.get(f, "")
                        if new_val:
                            curr_val = getattr(existing_company, f, "")
                            if curr_val != new_val:
                                setattr(existing_company, f, new_val)
                                is_changed = True

                    if is_changed:
                        existing_company.save()
                        updated_companies += 1
                    else:
                        existing_unchanged += 1
                else:
                    new_company = Company(
                        name=company_name,
                        sector=row_data.get("sector", ""),
                        job_position=row_data.get("job_position", ""),
                        openings=row_data.get("openings", ""),
                        salary_ctc=row_data.get("salary_ctc", ""),
                        qualification=row_data.get("qualification", ""),
                        location=row_data.get("location", ""),
                        gender=row_data.get("gender", ""),
                        eligibility=row_data.get("eligibility", ""),
                        facilities=row_data.get("facilities", ""),
                        room_no=row_data.get("room_no", ""),
                    )
                    new_company.save()
                    new_companies += 1

                    exact_lower_map[norm_lower] = new_company
                    for k in get_company_lookup_keys(company_name):
                        norm_key_map[k] = new_company

        detected_columns = [
            FIELD_DISPLAY_LABELS.get(f, f) for f in col_mappings.values()
        ]

        return Response(
            {
                "message": (
                    f"Import Complete: {new_companies} new companies added, {updated_companies} updated."
                    if not clear_existing
                    else f"Reset & Import Complete: {new_companies} companies added."
                ),
                "total_rows": total_rows_processed,
                "new_companies": new_companies,
                "updated_companies": updated_companies,
                "existing_companies": existing_unchanged,
                "invalid_rows": invalid_rows,
                "columns_detected": detected_columns,
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
        ws.title = "Company Roster Template"

        headers = [
            "S.No",
            "Company Name",
            "Sector",
            "Job Position",
            "Openings",
            "Salary / CTC",
            "Qualification",
            "Location",
            "Gender",
            "Eligibility",
            "Facilities",
            "Room No.",
        ]

        header_font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
        header_fill = PatternFill(
            start_color="1E3A8A", end_color="1E3A8A", fill_type="solid"
        )
        for col_idx, h_text in enumerate(headers, start=1):
            cell = ws.cell(row=1, column=col_idx, value=h_text)
            cell.font = header_font
            cell.fill = header_fill

        sample_rows = [
            (
                1,
                "Tata Consultancy Services (TCS)",
                "IT / Software",
                "Software Trainee",
                "25",
                "4.0 LPA",
                "B.Tech (CSE, IT, ECE), MCA",
                "Hyderabad",
                "Any",
                "60% in B.Tech, No active backlogs",
                "Cab facility, Subsidized food",
                "CF-01",
            ),
            (
                2,
                "Infosys Limited",
                "IT Services",
                "Systems Engineer",
                "20",
                "3.6 LPA",
                "B.Tech / MCA",
                "Hyderabad / Bengaluru",
                "Any",
                "65% Throughout",
                "Transport provided",
                "CF-02",
            ),
            (
                3,
                "BOSCH Global Software",
                "Embedded & Auto",
                "Graduate Trainee Engineer",
                "10",
                "5.5 LPA",
                "B.Tech (ECE, EEE, CSE)",
                "Hyderabad",
                "Any",
                "70% or 7.0 CGPA",
                "Health Insurance, Free Food",
                "Room 204",
            ),
            (
                4,
                "Cyient Technologies",
                "Engineering Solutions",
                "Design Trainee",
                "15",
                "3.2 LPA",
                "B.Tech (Mechanical, Civil, EEE)",
                "Hyderabad",
                "Male / Female",
                "60% Aggregate",
                "Bus Facility",
                "Stall 08",
            ),
            (
                5,
                "HCLTech",
                "Cloud & Infrastructure",
                "Analyst",
                "12",
                "4.25 LPA",
                "Any Graduate / B.Tech",
                "Hyderabad",
                "Any",
                "No standing arrears",
                "Shift Allowance",
                "Room 208",
            ),
        ]

        for row_idx, row_values in enumerate(sample_rows, start=2):
            for col_idx, val in enumerate(row_values, start=1):
                ws.cell(row=row_idx, column=col_idx, value=val)

        col_widths = {
            "A": 8,
            "B": 32,
            "C": 18,
            "D": 24,
            "E": 12,
            "F": 15,
            "G": 28,
            "H": 20,
            "I": 14,
            "J": 30,
            "K": 28,
            "L": 14,
        }
        for col_letter, width in col_widths.items():
            ws.column_dimensions[col_letter].width = width

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = (
            'attachment; filename="JobMela_Company_Upload_Template.xlsx"'
        )
        response["Access-Control-Expose-Headers"] = "Content-Disposition"
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


# =====================================================================
# AUTOMATIC ROOM ALLOCATION SYSTEM & QR CODE MANAGEMENT
# =====================================================================

import qrcode.image.svg


def generate_qr_svg(data_text: str) -> str:
    """Generate high-contrast vector SVG QR code (pure Python, Pillow not required)."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(data_text)
    qr.make(fit=True)
    img = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
    buf = io.BytesIO()
    img.save(buf)
    return buf.getvalue().decode("utf-8")


def parse_room_excel(uploaded_file):
    """
    Parses Room Numbers from uploaded Excel.
    Supports columns: Room No, Room Number, Room, Room ID, etc.
    Extracts rooms sequentially, tracks duplicates and blank cells.
    """
    try:
        wb = load_workbook(uploaded_file, data_only=True)
        ws = wb.active
    except Exception as e:
        raise ValueError(f"Failed to read the Excel spreadsheet: {str(e)}")

    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        raise ValueError("The uploaded Excel file contains no data.")

    room_col_patterns = [
        "room no",
        "room number",
        "room",
        "room id",
        "room_no",
        "roomno",
        "room #",
        "room_id",
        "cabin",
        "hall",
        "venue",
    ]

    target_col = None
    start_row = 0

    # Scan first 10 rows for a matching room header
    for r_idx, row in enumerate(rows[:10]):
        if not row:
            continue
        for c_idx, cell in enumerate(row):
            if cell is not None:
                val = str(cell).strip().lower()
                val_norm = re.sub(r"[^a-z0-9]", " ", val).strip()
                val_single = re.sub(r"\s+", " ", val_norm)
                for pat in room_col_patterns:
                    if pat == val_single or pat == val_norm or val_single.startswith(pat):
                        target_col = c_idx
                        start_row = r_idx + 1
                        break
            if target_col is not None:
                break
        if target_col is not None:
            break

    # If no header was found, fallback to column 0
    if target_col is None:
        target_col = 0
        first_val = str(rows[0][0]).strip().lower() if rows[0] and rows[0][0] is not None else ""
        if any(p in first_val for p in ["room", "no", "id", "s.no"]):
            start_row = 1
        else:
            start_row = 0

    seen_set = set()
    unique_rooms = []
    duplicates_detected = []
    blank_rows = 0

    for row in rows[start_row:]:
        if not row or target_col >= len(row) or row[target_col] is None:
            blank_rows += 1
            continue

        raw_val = row[target_col]
        # Clean number representation
        if isinstance(raw_val, float) and raw_val.is_integer():
            rm_str = str(int(raw_val)).strip()
        else:
            rm_str = str(raw_val).strip()

        if not rm_str or rm_str.lower() in ["", "none", "null", "nan", "-", "--"]:
            blank_rows += 1
            continue

        rm_key = rm_str.lower()
        if rm_key in seen_set:
            if rm_str not in duplicates_detected:
                duplicates_detected.append(rm_str)
        else:
            seen_set.add(rm_key)
            unique_rooms.append(rm_str)

    return {
        "unique_rooms": unique_rooms,
        "duplicates_detected": duplicates_detected,
        "blank_rows": blank_rows,
        "total_rows_scanned": len(rows),
    }


class AdminRoomsSummaryView(APIView):
    """
    Returns complete room allocation overview, company counts, room counts,
    and the list of current company -> room pairings.
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        companies = (
            Company.objects.select_related("assigned_room")
            .annotate(checkins_cnt=Count("assigned_room__checkins"))
            .order_by("id")
        )
        total_companies = len(companies)
        rooms = Room.objects.all().order_by("room_number")
        total_rooms = rooms.count()

        allocated_companies_count = sum(1 for c in companies if c.assigned_room_id is not None)
        unallocated_companies_count = total_companies - allocated_companies_count

        assigned_room_ids = {c.assigned_room_id for c in companies if c.assigned_room_id is not None}
        available_rooms_count = rooms.exclude(id__in=assigned_room_ids).count()

        allocations = []
        for c in companies:
            allocations.append({
                "company_id": c.id,
                "company_name": c.name,
                "sector": c.sector,
                "job_position": c.job_position,
                "room_id": c.assigned_room_id,
                "room_number": c.assigned_room.room_number if c.assigned_room else (c.room_no or "Unallocated"),
                "unique_room_token": c.assigned_room.unique_room_token if c.assigned_room else None,
                "qr_status": c.assigned_room.qr_status if c.assigned_room else "inactive",
                "checkins_count": c.checkins_cnt,
            })

        return Response({
            "total_companies": total_companies,
            "total_rooms": total_rooms,
            "allocated_companies_count": allocated_companies_count,
            "unallocated_companies_count": unallocated_companies_count,
            "available_rooms_count": available_rooms_count,
            "allocations": allocations,
        }, status=status.HTTP_200_OK)


class AdminRoomExcelPreviewView(APIView):
    """
    Uploads a Room Numbers Excel file, validates column formatting,
    detects duplicates, compares Total Companies vs Available Rooms,
    and returns a preview of the sequential Company -> Room allocation.
    """
    permission_classes = [IsAdminUserRole]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"error": "No file uploaded. Please select a Room Numbers Excel file (.xlsx or .xls)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        filename = uploaded_file.name.lower()
        if not (filename.endswith(".xlsx") or filename.endswith(".xls")):
            return Response(
                {"error": "Invalid file format. Please upload an Excel spreadsheet (.xlsx or .xls)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            parsed = parse_room_excel(uploaded_file)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        available_rooms = parsed["unique_rooms"]
        if not available_rooms:
            return Response(
                {"error": "No valid room numbers found in the uploaded Excel file. Please ensure a 'Room No' column exists with valid room values."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        companies = list(Company.objects.all().order_by("id"))
        total_companies = len(companies)

        if total_companies == 0:
            return Response(
                {"error": "No companies found in the database. Please upload your Company Excel list first before allocating rooms."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_available_rooms = len(available_rooms)

        # Requirement 3: Compare Total Companies vs Total Available Rooms
        if total_available_rooms < total_companies:
            return Response(
                {
                    "error": f"Insufficient rooms. {total_companies} companies require {total_companies} rooms, but only {total_available_rooms} rooms are available in the uploaded file.",
                    "total_companies": total_companies,
                    "available_rooms_count": total_available_rooms,
                    "rooms_required": total_companies,
                    "duplicates_detected": parsed["duplicates_detected"],
                    "blank_rows": parsed["blank_rows"],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Requirement 4: Preview Before Confirmation
        preview_pairs = []
        for i in range(total_companies):
            c = companies[i]
            preview_pairs.append({
                "company_id": c.id,
                "company_name": c.name,
                "sector": c.sector,
                "job_position": c.job_position,
                "current_room": c.room_no or "Unallocated",
                "new_room": available_rooms[i],
            })

        unused_rooms = available_rooms[total_companies:]

        return Response(
            {
                "valid": True,
                "filename": uploaded_file.name,
                "total_companies": total_companies,
                "available_rooms_count": total_available_rooms,
                "rooms_required": total_companies,
                "rooms_used": total_companies,
                "unused_rooms_count": len(unused_rooms),
                "unused_rooms": unused_rooms[:20],
                "duplicates_detected": parsed["duplicates_detected"],
                "blank_rows": parsed["blank_rows"],
                "preview_pairs": preview_pairs,
                "rooms_sequence": available_rooms,
            },
            status=status.HTTP_200_OK,
        )


class AdminRoomConfirmAllocationView(APIView):
    """
    Transactional confirmation of automatic room allocation.
    Saves Company -> Room relationships and ensures Room QR identities
    are permanently preserved.
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        rooms = request.data.get("rooms", [])
        if not rooms or not isinstance(rooms, list):
            return Response(
                {"error": "No rooms list provided for allocation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        companies = list(Company.objects.all().order_by("id"))
        total_companies = len(companies)

        if total_companies == 0:
            return Response(
                {"error": "No companies found in database."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(rooms) < total_companies:
            return Response(
                {"error": f"Insufficient rooms. {total_companies} companies require {total_companies} rooms, but only {len(rooms)} were supplied."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Requirement 5 & 6: Transactional allocation preserving Room QR identities
        try:
            with transaction.atomic():
                import uuid
                clean_room_numbers = [str(r).strip() for r in rooms]
                existing_rooms = {r.room_number: r for r in Room.objects.filter(room_number__in=clean_room_numbers)}

                new_room_objs = []
                seen_new = set()
                for r_num in clean_room_numbers:
                    if r_num not in existing_rooms and r_num not in seen_new:
                        clean_n = "".join(c for c in r_num if c.isalnum())
                        tok = f"RM_{clean_n}_{uuid.uuid4().hex[:8].upper()}"
                        new_room_objs.append(Room(room_number=r_num, unique_room_token=tok))
                        seen_new.add(r_num)

                if new_room_objs:
                    Room.objects.bulk_create(new_room_objs, ignore_conflicts=True)
                    room_map = {r.room_number: r for r in Room.objects.filter(room_number__in=clean_room_numbers)}
                else:
                    room_map = existing_rooms

                Company.objects.update(assigned_room=None, room_no="")

                for i in range(total_companies):
                    c = companies[i]
                    target_rm_no = str(rooms[i]).strip()
                    target_room = room_map[target_rm_no]
                    c.assigned_room = target_room
                    c.room_no = target_room.room_number

                Company.objects.bulk_update(companies, ["assigned_room", "room_no"])

            return Response(
                {
                    "success": True,
                    "message": f"Successfully allocated {total_companies} companies to {total_companies} rooms.",
                    "allocated_count": total_companies,
                    "unused_rooms_count": len(rooms) - total_companies,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to save allocation: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AdminRoomTemplateDownloadView(APIView):
    """
    Downloads standard Excel template for Room Numbers upload.
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        wb = Workbook()
        ws = wb.active
        ws.title = "Room Numbers"

        navy_header = PatternFill(
            start_color="1E3A8A", end_color="1E3A8A", fill_type="solid"
        )
        accent_fill = PatternFill(
            start_color="F8FAFC", end_color="F8FAFC", fill_type="solid"
        )
        title_font = Font(name="Calibri", size=14, bold=True, color="1E3A8A")
        sub_font = Font(name="Calibri", size=10, italic=True, color="475569")
        white_bold = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        data_font = Font(name="Calibri", size=11, color="0F172A")
        thin_border = Border(
            left=Side(style="thin", color="CBD5E1"),
            right=Side(style="thin", color="CBD5E1"),
            top=Side(style="thin", color="CBD5E1"),
            bottom=Side(style="thin", color="CBD5E1"),
        )

        ws.merge_cells("A1:B1")
        ws.cell(row=1, column=1, value="TKRCET JOB MELA 2026 — ROOM NUMBERS TEMPLATE").font = title_font
        ws.merge_cells("A2:B2")
        ws.cell(row=2, column=1, value="Fill column 'Room No' with your interview room numbers in sequence. Only 'Room No' is required.").font = sub_font

        ws.cell(row=4, column=1, value="S.No").font = white_bold
        ws.cell(row=4, column=1).fill = navy_header
        ws.cell(row=4, column=1).alignment = Alignment(horizontal="center", vertical="center")
        ws.cell(row=4, column=1).border = thin_border

        ws.cell(row=4, column=2, value="Room No").font = white_bold
        ws.cell(row=4, column=2).fill = navy_header
        ws.cell(row=4, column=2).alignment = Alignment(horizontal="center", vertical="center")
        ws.cell(row=4, column=2).border = thin_border

        sample_rooms = [
            "101", "102", "103", "104", "105",
            "201", "202", "203", "204", "205",
            "CF-01", "CF-02", "CF-03", "SF-01", "SF-02"
        ]

        for idx, rm in enumerate(sample_rooms, start=1):
            curr_row = 4 + idx
            ws.cell(row=curr_row, column=1, value=idx).alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row=curr_row, column=1).border = thin_border
            ws.cell(row=curr_row, column=1).font = data_font

            ws.cell(row=curr_row, column=2, value=rm).alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row=curr_row, column=2).border = thin_border
            ws.cell(row=curr_row, column=2).font = data_font

            if idx % 2 == 0:
                ws.cell(row=curr_row, column=1).fill = accent_fill
                ws.cell(row=curr_row, column=2).fill = accent_fill

        ws.column_dimensions["A"].width = 10
        ws.column_dimensions["B"].width = 25

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = 'attachment; filename="Room_Numbers_Template.xlsx"'
        return response


class AdminRoomQRDetailView(APIView):
    """
    Returns room details along with a high-resolution base64 PNG QR code
    and direct candidate check-in link.
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"error": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

        company = room.companies.first()
        frontend_url = getattr(settings, "FRONTEND_URL", "https://jobmela.vercel.app").rstrip("/")
        checkin_url = f"{frontend_url}/checkin/{room.unique_room_token}"
        qr_svg = generate_qr_svg(checkin_url)

        return Response({
            "id": room.id,
            "room_number": room.room_number,
            "unique_room_token": room.unique_room_token,
            "qr_status": room.qr_status,
            "active": room.active,
            "checkin_url": checkin_url,
            "qr_svg": qr_svg,
            "assigned_company": {
                "id": company.id,
                "name": company.name,
                "sector": company.sector,
                "job_position": company.job_position,
            } if company else None,
            "checkins_count": room.checkins.count(),
        }, status=status.HTTP_200_OK)


class AdminRoomToggleStatusView(APIView):
    """
    Toggles room QR code status between 'active' and 'inactive'.
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"error": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("qr_status")
        if new_status in ["active", "inactive"]:
            room.qr_status = new_status
        else:
            room.qr_status = "inactive" if room.qr_status == "active" else "active"

        room.save(update_fields=["qr_status"])
        return Response({
            "id": room.id,
            "room_number": room.room_number,
            "qr_status": room.qr_status,
            "message": f"Room {room.room_number} QR status updated to {room.qr_status}."
        }, status=status.HTTP_200_OK)


class StudentRoomCheckInView(APIView):
    """
    Student QR scan & interview check-in endpoint.
    GET: Resolves room & assigned company information for candidate display.
    POST: Records candidate check-in to that room/company.
    """
    permission_classes = [AllowAny]
    def get(self, request, token):
        try:
            room = Room.objects.get(unique_room_token=token)
        except Room.DoesNotExist:
            return Response({"error": "Invalid room QR code or room not found."}, status=status.HTTP_404_NOT_FOUND)

        company = room.companies.first()
        already_checked_in = False
        checked_in_at = None

        if request.user and request.user.is_authenticated:
            existing = RoomCheckIn.objects.filter(student=request.user, room=room).first()
            if existing:
                already_checked_in = True
                checked_in_at = existing.checked_in_at.strftime("%I:%M %p, %d %b %Y")

        return Response({
            "room_id": room.id,
            "room_number": room.room_number,
            "qr_status": room.qr_status,
            "company": {
                "id": company.id,
                "name": company.name,
                "sector": company.sector,
                "job_position": company.job_position,
                "location": company.location,
                "salary_ctc": company.salary_ctc,
            } if company else None,
            "already_checked_in": already_checked_in,
            "checked_in_at": checked_in_at,
        }, status=status.HTTP_200_OK)

    def post(self, request, token):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"error": "Please login to your candidate account to complete interview check-in."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            room = Room.objects.get(unique_room_token=token)
        except Room.DoesNotExist:
            return Response({"error": "Invalid room QR code."}, status=status.HTTP_404_NOT_FOUND)

        if room.qr_status != "active":
            return Response(
                {"error": f"Room {room.room_number} QR check-in is currently inactive. Please contact the help desk."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        company = room.companies.first()

        checkin, created = RoomCheckIn.objects.get_or_create(
            student=request.user,
            room=room,
            defaults={"company": company},
        )

        return Response({
            "success": True,
            "already_checked_in": not created,
            "message": f"Successfully checked in to Room {room.room_number}" + (f" for {company.name}!" if company else "!"),
            "room_number": room.room_number,
            "company_name": company.name if company else None,
            "checked_in_at": checkin.checked_in_at.strftime("%I:%M %p, %d %b %Y"),
        }, status=status.HTTP_200_OK)


