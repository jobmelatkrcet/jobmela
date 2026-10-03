# TKRCET JOB MELA 2026 — Full Stack Web Application

A production-ready full-stack web application built for the **TKR College of Engineering & Technology (TKRCET) Job Mela 2026** scheduled for **31 October 2026**.

The platform connects **100+ participating recruiting companies/campuses** with **up to 10,000 eligible students** from diverse educational backgrounds (10th, Diploma, Degree, B.Tech, etc.).

---

## 🏛️ Event Information

- **Event:** TKRCET Job Mela 2026
- **Date:** 31 October 2026
- **Venue:** TKR College of Engineering & Technology, Medbowli, Meerpet, Saroornagar, Hyderabad, Telangana — 500097
- **Key Coordinators:**
  - Srinivas Reddy: `9949139414`
  - Ashwini Reddy: `7075450757`

---

## 📁 Project Architecture & Folder Structure

The project is developed with a clean, decoupled architecture:

```
Jobmela/
├── sample_companies_template.xlsx   # Ready-to-use sample Excel upload file
├── README.md                        # Master project documentation
│
├── backend/                         # Django & Django REST Framework
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   ├── test_api_flow.py             # Integration test suite
│   ├── test_e2e_full_flow.py        # Live HTTP E2E verification suite
│   ├── config/                      # Core settings, urls, wsgi/asgi
│   ├── accounts/                    # Custom User model, auth & profile
│   ├── companies/                   # Company directory & public APIs
│   ├── applications/                # Student-Company applications logic
│   ├── admin_api/                   # Admin stats, Excel import & Excel export
│   └── README.md                    # Backend specific guide
│
└── frontend/                        # React + Vite Application
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── App.jsx                  # Main routing & guards
    │   ├── main.jsx                 # Entry point
    │   ├── index.css                # Modern design system & styles
    │   ├── components/              # Navbar, Footer, Modal, Pagination, Alert, StatsCard
    │   ├── context/                 # AuthContext (JWT/Token state)
    │   ├── layouts/                 # Public, Student, and Admin layouts
    │   ├── pages/
    │   │   ├── public/              # Home, About, Companies, Contact
    │   │   ├── student/             # Register, Login, Dashboard, Profile, Applications
    │   │   └── admin/               # Login, Dashboard, Students, Companies, Export
    │   └── services/                # Axios API services (auth, company, application, admin)
    └── README.md                    # Frontend specific guide
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ (Node.js 20 recommended) and npm

---

### Step 1: Backend Setup (Django REST Framework)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
   *(On Windows: `.venv\Scripts\activate`)*

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

5. Seed initial admin user and 30 participating companies:
   ```bash
   python manage.py seed_data
   ```

6. Start the backend development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   The backend API will be available at: **`http://127.0.0.1:8000/`**

---

### Step 2: Frontend Setup (React + Vite)

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
   The frontend application will be live at: **`http://127.0.0.1:5173/`**

---

## 🔑 Default Credentials

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Organizer / Admin** | `admin@tkrcet.ac.in` | `admin123` | [Admin Portal](http://127.0.0.1:5173/admin/login) |
| **Demo Student** | `student@tkrcet.ac.in` | `student123` | [Student Portal](http://127.0.0.1:5173/login) |

*You can also register a brand new student directly via the registration form.*

---

## 🧪 Testing the Complete Workflow

You can verify all workflows automatically using the pre-built test suite:

```bash
cd backend
source .venv/bin/activate
python test_e2e_full_flow.py
```

### Complete End-to-End Checklist:

1. **Student Registration:**
   - Go to `http://127.0.0.1:5173/register`
   - Fill in Name, Email (unique), Mobile, Qualification, College, Password
   - Successfully registers and logs into Student Dashboard.

2. **Student Dashboard & Applying to Multiple Companies:**
   - Displays real-time database counts for Available Companies and Applied Companies.
   - Click **"Browse Companies"**, search by name (e.g. "TCS").
   - Click **APPLY** -> confirmation modal appears -> click **Confirm**.
   - Button immediately switches to **"✓ Applied"**.
   - Apply to 3+ companies (e.g. TCS, Infosys, HCLTech).

3. **Duplicate Prevention:**
   - Once applied, the company displays **"✓ Applied"**.
   - Attempting to re-apply via backend is blocked with a 400 Bad Request and database unique constraint (`student + company`).

4. **My Applications:**
   - Go to **"My Applications"** tab.
   - Displays all registered companies with applied timestamps and counter.

5. **Admin Dashboard & Student Management:**
   - Log out from student account and go to `http://127.0.0.1:5173/admin/login`.
   - Log in with `admin@tkrcet.ac.in` / `admin123`.
   - View real-time database metrics: Total Students, Total Companies, Total Applications.
   - Inspect the **Students** tab, search candidates, click **View** to see student details and applied companies.

6. **Company Management & Excel Upload:**
   - Go to **Companies** tab in Admin Panel.
   - Displays all companies annotated with `X Students Registered`.
   - Click **[ UPLOAD COMPANIES EXCEL ]** and select `sample_companies_template.xlsx`.
   - System validates, adds new companies, ignores duplicates, and displays a comprehensive import report.

7. **Company Details & Company-wise Excel Export:**
   - Click **[ VIEW STUDENTS ]** next to any company (e.g., TCS).
   - Only students registered for that specific company are displayed.
   - Click **[ EXPORT STUDENTS EXCEL ]** to instantly download `{Company_Name}_Registered_Students.xlsx` containing formatted student details for that company.

---

## 🛡️ Security & Role-Based Authorization

- **Password Hashing:** Passwords are hashed using PBKDF2 with SHA-256. Plaintext passwords are never stored.
- **Token Authentication:** Secure token-based authentication with automatic headers injection via Axios interceptors.
- **Role Guards:** Students are strictly prohibited from accessing admin endpoints (returns `403 Forbidden`).
- **Data Isolation:** Students can only access their own profile and applications.
