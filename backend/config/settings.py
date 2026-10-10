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

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY", "").strip()
if not SECRET_KEY:
    raise ImproperlyConfigured(
        "SECRET_KEY environment variable is required and cannot be empty. "
        "Please configure a secure cryptographic secret key in your environment."
    )

# Production Debug Mode (Default: False for security)
DEBUG = os.environ.get("DEBUG", "False").strip().lower() in ("true", "1", "yes")

# Allowed hosts configuration
raw_hosts = os.environ.get("ALLOWED_HOSTS", "").strip()
if raw_hosts:
    ALLOWED_HOSTS = [h.strip() for h in raw_hosts.split(",") if h.strip()]
    if not DEBUG and "*" in ALLOWED_HOSTS:
        raise ImproperlyConfigured(
            "Wildcard '*' in ALLOWED_HOSTS is not permitted in production."
        )
elif DEBUG:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]"]
else:
    raise ImproperlyConfigured(
        "ALLOWED_HOSTS environment variable is required in production (when DEBUG=False). "
        "Please configure comma-separated trusted hostnames (e.g. '.vercel.app,jobmela-z1tj.vercel.app')."
    )


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
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = False  # DRF TokenAuthentication uses Authorization header; session cookies not required across origins

# Legitimate production frontend origin
default_cors_origins = [
    "https://jobmela.vercel.app",
]

# Configurable through environment variable (CORS_ALLOWED_ORIGINS or FRONTEND_URL)
custom_cors = os.environ.get("CORS_ALLOWED_ORIGINS", "").strip()
frontend_url = os.environ.get("FRONTEND_URL", "").strip()

if custom_cors:
    cors_list = [o.strip() for o in custom_cors.split(",") if o.strip()]
else:
    cors_list = list(default_cors_origins)
    if frontend_url and frontend_url not in cors_list:
        cors_list.append(frontend_url)

# Localhost origins available for development only when DEBUG is enabled
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
    origin for origin in CORS_ALLOWED_ORIGINS if origin.startswith("http")
]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
