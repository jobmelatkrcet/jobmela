# TKRCET Job Mela 2026 — Backend Service

Django and Django REST Framework backend service for TKRCET Job Mela 2026.

## 🛠️ Tech Stack
- Python 3.12+
- Django 6.1+
- Django REST Framework (DRF)
- SQLite (Configurable for PostgreSQL/MySQL via `.env`)
- `openpyxl` for Excel generation and ingestion
- `django-cors-headers`

---

## 📡 REST API Documentation

### 1. Authentication (`/api/auth/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Public | Register a new student |
| `POST` | `/api/auth/login/` | Public | Login with email & password; returns auth token & user object |
| `POST` | `/api/auth/logout/` | Authenticated | Revoke user session & token |
| `GET` | `/api/auth/profile/` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile/` | Authenticated | Update user profile information |

#### Sample Registration Payload:
```json
{
  "full_name": "Rahul Sharma",
  "email": "rahul.sharma@tkrcet.ac.in",
  "mobile": "9876543210",
  "qualification": "B.Tech (CSE)",
  "college": "TKR College of Engineering & Technology",
  "password": "SecurePassword123",
  "confirm_password": "SecurePassword123"
}
```

---

### 2. Participating Companies (`/api/companies/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/companies/?search=tcs&page=1` | Public / Student | List participating companies with search and pagination. If student is logged in, includes `has_applied: true/false`. |
| `GET` | `/api/companies/<id>/` | Public / Student | Retrieve single company details |

---

### 3. Student Applications (`/api/applications/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications/` | Student Only | Apply to a company (`{ "company_id": 1 }`). Rejects duplicate with 400. |
| `GET` | `/api/applications/my/` | Student Only | Retrieve list of all companies applied by the student |
| `GET` | `/api/applications/stats/` | Student Only | Returns `{ "total_companies": 30, "applied_count": 3 }` |

---

### 4. Admin & Organizer APIs (`/api/admin/`)

*Strictly requires `is_staff=True` or `role='admin'`. Returns `403 Forbidden` for students.*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard/` | Admin Only | Event statistics: total students, companies, applications, top recruiters |
| `GET` | `/api/admin/students/?search=rahul&page=1` | Admin Only | Paginated list of registered students with application counts |
| `GET` | `/api/admin/students/<id>/` | Admin Only | Detailed student profile + all companies applied |
| `GET` | `/api/admin/companies/?search=tcs&order=applications_desc` | Admin Only | List companies with `registered_students_count` |
| `GET` | `/api/admin/companies/<id>/` | Admin Only | Retrieve single company info |
| `GET` | `/api/admin/companies/<id>/students/?page=1` | Admin Only | Paginated list of students registered for this specific company |
| `GET` | `/api/admin/companies/<id>/export/` | Admin Only | Generates and downloads `{Company}_Registered_Students.xlsx` |
| `POST` | `/api/admin/companies/upload/` | Admin Only | Multipart upload of Excel file to import company list |
| `GET` | `/api/admin/companies/template/` | Admin Only | Download standard Excel template for company upload |

---

## 🗄️ Database Seeding & Admin Creation

To re-seed the default data:
```bash
python manage.py seed_data
```

This creates:
- Superuser: `admin@tkrcet.ac.in` / `admin123`
- Demo student: `student@tkrcet.ac.in` / `student123`
- 30 Top Participating Companies
