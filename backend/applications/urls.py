from django.urls import path
from .views import ApplyCompanyView, MyApplicationsView, StudentStatsView

urlpatterns = [
    path("", ApplyCompanyView.as_view(), name="apply-company"),
    path("my/", MyApplicationsView.as_view(), name="my-applications"),
    path("stats/", StudentStatsView.as_view(), name="student-stats"),
]
