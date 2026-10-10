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

---

## ☁️ Supabase Storage Configuration (Student Documents)

Candidate passport photographs and resumes are stored securely in Supabase Cloud Storage instead of Vercel serverless local disk.

### 1. Bucket Setup in Supabase Dashboard
1. Log into your project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Navigate to **Storage** -> **New Bucket**.
3. Name the bucket: `student-documents`.
4. **Set Bucket Access:** Ensure **Public bucket** is **OFF / Disabled** (this must remain a strictly private bucket).
5. Allowed MIME types:
   - Images: `image/jpeg, image/png, image/webp`
   - Documents: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
6. Maximum file size: `5MB` (or leave default).

### 2. Environment Variables in Vercel
Add the following environment variables to your backend Vercel project under **Project Settings** -> **Environment Variables**:

| Variable | Description | Example / Format |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase Project API URL | `https://your-project-ref.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key (Server-side privileged access) | `eyJhbGciOi...` (Find in Dashboard -> Project Settings -> API -> `service_role secret`) |
| `SUPABASE_STORAGE_BUCKET` | Name of the private storage bucket | `student-documents` |

> ⚠️ **SECURITY WARNING:** The `service_role` key must **NEVER** be shared, committed to Git, or exposed in frontend Vite/React code. It is used strictly server-side by Django.

### 3. Access Control & Signed URLs
- Files in `student-documents` cannot be accessed publicly.
- When authenticated students view their profile (`/api/auth/profile/`) or admins view the candidate directory (`/api/admin/students/`), Django generates short-lived signed URLs with cryptographic HMAC tokens.
- Authenticated download endpoints:
  - `GET /api/auth/document/<photo|resume>/`: Authenticated student retrieves their own signed document URL.
  - `GET /api/auth/students/<student_id>/document/<photo|resume>/`: Administrators can access any candidate document; students are forbidden (`403`) from accessing other students' files.

### 4. Post-Deployment Verification
1. Navigate to `https://jobmela.vercel.app/register`.
2. Fill out the student registration form and attach a passport photo (`.jpg`/`.png` < 3MB) and resume (`.pdf`/`.docx` < 5MB).
3. Submit registration. Verify that the student is logged in and redirected to `/dashboard`.
4. Verify that the candidate photograph renders on the Admit Card and the resume download link works.
5. In Supabase Dashboard -> Storage -> `student-documents`, verify the files are present in `photos/` and `resumes/`.
