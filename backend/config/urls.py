from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from admin_api.views import (
    JobMelaRequirementsPublicListView,
    StudentRoomCheckInView,
    StudentAttemptsView,
)


def root_health_check(request):
    return JsonResponse(
        {
            "event": "TKRCET JOB MELA 2026",
            "date": "31 October 2026",
            "venue": "TKR College of Engineering & Technology",
            "status": "Online",
            "api_version": "v1.0",
        }
    )


from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", root_health_check, name="api-root"),
    path("api/", root_health_check, name="api-root-alias"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/companies/", include("companies.urls")),
    path("api/applications/", include("applications.urls")),
    path("api/admin/", include("admin_api.urls")),
    path(
        "api/requirements/",
        JobMelaRequirementsPublicListView.as_view(),
        name="public-requirements",
    ),
    path(
        "api/rooms/checkin/<str:token>/",
        StudentRoomCheckInView.as_view(),
        name="student-room-checkin",
    ),
    path(
        "api/rooms/my-attempts/",
        StudentAttemptsView.as_view(),
        name="student-room-attempts",
    ),
]

if settings.MEDIA_URL:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

