import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import io
from openpyxl import Workbook
from rest_framework.test import APIClient
from accounts.models import User
from companies.models import Company
from applications.models import Application

client = APIClient()

print("=== STARTING FULL BACKEND INTEGRATION TEST ===")

# 1. Test Admin Login
resp = client.post(
    "/api/auth/login/",
    {"email": "admin@tkrcet.ac.in", "password": "admin123"},
    format="json",
)
assert resp.status_code == 200, f"Admin login failed: {resp.data}"
admin_token = resp.data["token"]
print("✓ Admin Login Passed, Token:", admin_token[:10] + "...")

# 2. Test Admin Dashboard Stats
client.credentials(HTTP_AUTHORIZATION="Token " + admin_token)
resp = client.get("/api/admin/dashboard/")
assert resp.status_code == 200, f"Admin dashboard failed: {resp.data}"
assert resp.data["total_companies"] >= 30
print(f"✓ Admin Dashboard Passed: Total Companies={resp.data['total_companies']}, Applications={resp.data['total_applications']}")

# 3. Test Student Registration
test_email = "test_applicant@tkrcet.ac.in"
User.objects.filter(email=test_email).delete()

reg_data = {
    "full_name": "Deepika Rao",
    "email": test_email,
    "mobile": "9123456780",
    "qualification": "B.Tech (ECE)",
    "college": "TKR College of Engineering & Technology",
    "password": "Password123",
    "confirm_password": "Password123",
}
resp = client.post("/api/auth/register/", reg_data, format="json")
assert resp.status_code == 201, f"Student registration failed: {resp.data}"
student_token = resp.data["token"]
student_id = resp.data["user"]["id"]
print("✓ Student Registration Passed, New Student ID:", student_id)

# 4. Test Student Duplicate Registration Blocked
resp_dup = client.post("/api/auth/register/", reg_data, format="json")
assert resp_dup.status_code == 400, "Duplicate registration should fail"
print("✓ Duplicate Email Blocked correctly")

# 5. Test Student Profile
client.credentials(HTTP_AUTHORIZATION="Token " + student_token)
resp = client.get("/api/auth/profile/")
assert resp.status_code == 200, f"Profile failed: {resp.data}"
assert resp.data["email"] == test_email
print("✓ Student Profile Passed:", resp.data["full_name"])

# 6. Test Browse Companies
resp = client.get("/api/companies/")
assert resp.status_code == 200, f"Companies list failed: {resp.data}"
companies = resp.data["results"]
assert len(companies) > 0
print(f"✓ Browse Companies Passed: Found {resp.data['count']} total companies")

# 7. Test Apply to Company A, B, C
c1, c2, c3 = companies[0]["id"], companies[1]["id"], companies[2]["id"]
for cid in [c1, c2, c3]:
    r = client.post("/api/applications/", {"company_id": cid}, format="json")
    assert r.status_code == 201, f"Application for {cid} failed: {r.data}"
print(f"✓ Successfully applied to 3 companies ({c1}, {c2}, {c3})")

# 8. Test Duplicate Application Rejection
r_dup = client.post("/api/applications/", {"company_id": c1}, format="json")
assert r_dup.status_code == 400, "Duplicate application should fail"
print("✓ Duplicate application rejected correctly:", r_dup.data["error"])

# 9. Test My Applications
r_my = client.get("/api/applications/my/")
assert r_my.status_code == 200
assert r_my.data["total_applied"] == 3
print(f"✓ My Applications Passed: Student has {r_my.data['total_applied']} applications")

# 10. Test Security: Student trying to access Admin API (Should be 403 Forbidden)
r_sec = client.get("/api/admin/dashboard/")
assert r_sec.status_code == 403, f"Student should get 403 on admin endpoint, got {r_sec.status_code}"
print("✓ Student unauthorized access to admin endpoint correctly blocked with 403")

# 11. Test Admin View Company Students
client.credentials(HTTP_AUTHORIZATION="Token " + admin_token)
r_comp_stud = client.get(f"/api/admin/companies/{c1}/students/")
assert r_comp_stud.status_code == 200
print(f"✓ Admin Company Students View Passed: Found {r_comp_stud.data['count']} registered students for Company ID {c1}")

# 12. Test Company Excel Export
r_exp = client.get(f"/api/admin/companies/{c1}/export/")
assert r_exp.status_code == 200
assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in r_exp["Content-Type"]
assert "attachment; filename=" in r_exp["Content-Disposition"]
print("✓ Admin Company Excel Export Passed! Size:", len(r_exp.content), "bytes")

# 13. Test Admin Excel Upload
wb = Workbook()
ws = wb.active
ws.title = "Sheet1"
ws.append(["S.No", "Company Name"])
ws.append([1, "Tata Consultancy Services (TCS)"])  # existing
ws.append([2, "Brand New Tech Solutions 2026"])    # new
ws.append([3, "Brand New Innovations Pvt Ltd"])     # new
ws.append([4, "Brand New Innovations Pvt Ltd"])     # duplicate in sheet
excel_file = io.BytesIO()
wb.save(excel_file)
excel_file.seek(0)
excel_file.name = "Test_Companies.xlsx"

r_upload = client.post(
    "/api/admin/companies/upload/",
    {"file": excel_file},
    format="multipart",
)
assert r_upload.status_code == 200, f"Upload failed: {r_upload.data}"
assert r_upload.data["new_companies"] == 4
print("✓ Admin Excel Upload Passed:", r_upload.data)

print("\n🎉 ALL BACKEND INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
