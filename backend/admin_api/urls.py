from django.urls import path
from .views import (
    AdminDashboardView,
    AdminStudentsListView,
    AdminStudentDetailView,
    AdminCompaniesListView,
    AdminCompanyDetailView,
    AdminCompanyStudentsListView,
    AdminCompanyExcelExportView,
    AdminCompanyExcelUploadView,
    AdminCompanyTemplateDownloadView,
    JobMelaRequirementsPublicListView,
    AdminJobMelaRequirementListCreateView,
    AdminJobMelaRequirementDetailView,
)

urlpatterns = [
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("students/", AdminStudentsListView.as_view(), name="admin-students-list"),
    path(
        "students/<int:pk>/",
        AdminStudentDetailView.as_view(),
        name="admin-student-detail",
    ),
    path(
        "companies/",
        AdminCompaniesListView.as_view(),
        name="admin-companies-list",
    ),
    path(
        "companies/upload/",
        AdminCompanyExcelUploadView.as_view(),
        name="admin-companies-upload",
    ),
    path(
        "companies/template/",
        AdminCompanyTemplateDownloadView.as_view(),
        name="admin-companies-template",
    ),
    path(
        "companies/<int:pk>/",
        AdminCompanyDetailView.as_view(),
        name="admin-company-detail",
    ),
    path(
        "companies/<int:pk>/students/",
        AdminCompanyStudentsListView.as_view(),
        name="admin-company-students",
    ),
    path(
        "companies/<int:pk>/export/",
        AdminCompanyExcelExportView.as_view(),
        name="admin-company-export",
    ),
    # Requirements endpoints
    path(
        "requirements/",
        AdminJobMelaRequirementListCreateView.as_view(),
        name="admin-requirements-list-create",
    ),
    path(
        "requirements/<int:pk>/",
        AdminJobMelaRequirementDetailView.as_view(),
        name="admin-requirements-detail",
    ),
    path(
        "requirements/public/",
        JobMelaRequirementsPublicListView.as_view(),
        name="admin-requirements-public-alias",
    ),
]
