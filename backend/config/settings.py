"""
Django settings for TKRCET Job Mela 2026 platform.
"""

from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv
from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
load_dotenv(BASE_DIR / ".env")

import sys

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY", "").strip()
if not SECRET_KEY:
    if "test" in sys.argv or any("test" in a for a in sys.argv):
        SECRET_KEY = "django-insecure-test-secret-key-tkrcet-jobmela-2026"
    else:
        raise ImproperlyConfigured(
            "SECRET_KEY environment variable is required and cannot be empty. "
            "Please configure a secure cryptographic secret key in your environment."
        )

# Production Debug Mode (Default: False for security)
DEBUG = os.environ.get("DEBUG", "False").strip().lower() in ("true", "1", "yes")

# Canonical project hostnames trusted in production
DEFAULT_ALLOWED_HOSTS = [
    "jobmela-z1tj.vercel.app",
    "tkrcetjobmela.in",
    "www.tkrcetjobmela.in",
    "jobmela.vercel.app",
    "www.jobmela.vercel.app",
    "localhost",
    "127.0.0.1",
    "[::1]",
    "testserver",
]

# Allowed hosts configuration
raw_hosts = os.environ.get("ALLOWED_HOSTS", "").strip()
configured_hosts = list(DEFAULT_ALLOWED_HOSTS)

# Incorporate Vercel system-provided environment variables if available
for vercel_env_var in ("VERCEL_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_BRANCH_URL"):
    v_url = os.environ.get(vercel_env_var, "").strip()
    if v_url and v_url not in configured_hosts:
        configured_hosts.append(v_url)

if raw_hosts:
    custom_hosts = [h.strip() for h in raw_hosts.split(",") if h.strip()]
    if not DEBUG and "*" in custom_hosts:
        raise ImproperlyConfigured(
            "Wildcard '*' in ALLOWED_HOSTS is not permitted in production."
        )
    for host in custom_hosts:
        if host not in configured_hosts:
            configured_hosts.append(host)

ALLOWED_HOSTS = configured_hosts


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party apps
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    # Local apps
    "accounts",
    "companies",
    "applications",
    "admin_api",
]

MIDDLEWARE = [
    "config.middleware.VercelHostValidationMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database Configuration
# Supabase PostgreSQL Database exclusively via DATABASE_URL environment variable
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

if not DATABASE_URL:
    if "test" in sys.argv or any("test" in a for a in sys.argv):
        DATABASE_URL = "sqlite:///:memory:"
    else:
        raise ImproperlyConfigured(
            "DATABASE_URL environment variable is required and cannot be empty. "
            "Please configure a valid PostgreSQL connection URL in your environment."
        )

DATABASES = {
    "default": dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=0,
        conn_health_checks=True,
    )
}


# Custom User Model
AUTH_USER_MODEL = "accounts.User"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {
            "min_length": 6,
        },
    },
]


# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# Supabase Cloud Storage Configuration (Server-side private storage bucket)
def _clean_env_val(val, default=""):
    v = (val if val is not None else default).strip()
    return v.strip("'\"").strip()

SUPABASE_URL = _clean_env_val(os.environ.get("SUPABASE_URL", ""))
SUPABASE_SERVICE_ROLE_KEY = _clean_env_val(os.environ.get("SUPABASE_SERVICE_ROLE_KEY", ""))
SUPABASE_STORAGE_BUCKET = _clean_env_val(os.environ.get("SUPABASE_STORAGE_BUCKET", ""), "student-documents") or "student-documents"


# REST Framework configuration
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 15,
}

# Cross-Origin Resource Sharing (CORS) Configuration
# Disallow unrestricted CORS by default; restrict to authorized project domains
raw_cors_all = os.environ.get("CORS_ALLOW_ALL_ORIGINS", "False").strip().lower()
CORS_ALLOW_ALL_ORIGINS = raw_cors_all in ("true", "1", "yes")
CORS_ALLOW_CREDENTIALS = False

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

default_cors_origins = [
    "https://www.tkrcetjobmela.in",
    "https://tkrcetjobmela.in",
    "https://jobmela.vercel.app",
    "https://www.jobmela.vercel.app",
]

custom_cors = os.environ.get("CORS_ALLOWED_ORIGINS", "").strip()
frontend_url = os.environ.get("FRONTEND_URL", "").strip()

if custom_cors:
    cors_list = [o.strip() for o in custom_cors.split(",") if o.strip()]
else:
    cors_list = list(default_cors_origins)
    if frontend_url and frontend_url not in cors_list:
        cors_list.append(frontend_url)

if DEBUG:
    dev_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    for dev_origin in dev_origins:
        if dev_origin not in cors_list:
            cors_list.append(dev_origin)

CORS_ALLOWED_ORIGINS = cors_list

# CSRF Trusted Origins matching allowed frontend origins
CSRF_TRUSTED_ORIGINS = [
    "https://www.tkrcetjobmela.in",
    "https://tkrcetjobmela.in",
    "https://jobmela.vercel.app",
    "https://www.jobmela.vercel.app",
]
for origin in CORS_ALLOWED_ORIGINS:
    if origin.startswith("http") and origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(origin)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Email Configuration
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "").strip()
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "").replace(" ", "").strip()
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com").strip()
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587").strip() or 587)
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True").strip().lower() in ("true", "1", "yes")
EMAIL_USE_SSL = os.environ.get("EMAIL_USE_SSL", "False").strip().lower() in ("true", "1", "yes")
DEFAULT_FROM_EMAIL = os.environ.get(
    "DEFAULT_FROM_EMAIL",
    "TKRCET Mega Job Mela 2026 <no-reply@tkrcetjobmela.in>"
).strip()

default_email_backend = (
    "django.core.mail.backends.smtp.EmailBackend"
    if EMAIL_HOST_USER
    else ("django.core.mail.backends.console.EmailBackend" if DEBUG else "django.core.mail.backends.dummy.EmailBackend")
)
EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND", default_email_backend).strip()

# Password reset link validity (1 hour in seconds)
PASSWORD_RESET_TIMEOUT = int(os.environ.get("PASSWORD_RESET_TIMEOUT", "3600").strip() or 3600)

# Canonical Frontend URL for link generation
FRONTEND_URL = frontend_url or "https://www.tkrcetjobmela.in"
