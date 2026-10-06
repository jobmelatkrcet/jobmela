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
    AdminCompanyClearAllView,
    AdminCompanyTemplateDownloadView,
    AdminRoomsSummaryView,
    AdminRoomExcelPreviewView,
    AdminRoomConfirmAllocationView,
    AdminRoomTemplateDownloadView,
    AdminRoomQRDetailView,
    AdminRoomToggleStatusView,
    AdminLiveRoomCheckinsView,
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
        "companies/clear-all/",
        AdminCompanyClearAllView.as_view(),
        name="admin-companies-clear-all",
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
    # Room Allocation endpoints
    path("rooms/summary/", AdminRoomsSummaryView.as_view(), name="admin-rooms-summary"),
    path("rooms/upload-preview/", AdminRoomExcelPreviewView.as_view(), name="admin-rooms-upload-preview"),
    path("rooms/confirm-allocation/", AdminRoomConfirmAllocationView.as_view(), name="admin-rooms-confirm-allocation"),
    path("rooms/template/", AdminRoomTemplateDownloadView.as_view(), name="admin-rooms-template"),
    path("rooms/<int:pk>/qr/", AdminRoomQRDetailView.as_view(), name="admin-rooms-qr"),
    path("rooms/<int:pk>/toggle-status/", AdminRoomToggleStatusView.as_view(), name="admin-rooms-toggle-status"),
    path("rooms/live-checkins/", AdminLiveRoomCheckinsView.as_view(), name="admin-rooms-live-checkins"),

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
