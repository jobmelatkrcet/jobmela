import os
import re
import uuid
import logging
from django.conf import settings
from rest_framework import serializers

logger = logging.getLogger(__name__)

PHOTO_MAX_BYTES = 3 * 1024 * 1024  # 3 MB
PHOTO_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
PHOTO_ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "image/pjpeg",
    "image/x-png",
    "application/octet-stream",
}

RESUME_MAX_BYTES = 5 * 1024 * 1024  # 5 MB
RESUME_ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
RESUME_ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/x-pdf",
    "application/msword",
    "application/vnd.ms-word",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
    "application/zip",
    "application/x-zip-compressed",
}

CANONICAL_MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


class SupabaseStorageError(Exception):
    """
    Structured storage exception carrying a safe user-facing message
    and technical diagnostic details for server-side logging.
    """
    def __init__(self, user_message, technical_message=None, status_code=None):
        super().__init__(technical_message or user_message)
        self.user_message = user_message
        self.technical_message = technical_message or user_message
        self.status_code = status_code


def clean_supabase_url(raw_url):
    """
    Sanitizes and normalizes the Supabase project URL:
    - Strips surrounding quotes, whitespace, and newlines
    - Ensures https:// scheme
    - Removes trailing slashes and accidental subpaths (/storage/v1, /rest/v1)
    """
    if not raw_url:
        return ""
    url = str(raw_url).strip().strip("'\"").strip()
    if not url:
        return ""
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    url = url.rstrip("/")
    if url.endswith("/storage/v1"):
        url = url[:-11].rstrip("/")
    elif url.endswith("/rest/v1"):
        url = url[:-8].rstrip("/")
    return url


def clean_supabase_key(raw_key):
    """
    Sanitizes the Supabase service role key by stripping whitespace, quotes, and newlines.
    """
    if not raw_key:
        return ""
    return str(raw_key).strip().strip("'\"").strip()


def clean_bucket_name(raw_bucket):
    """
    Sanitizes the storage bucket name, defaulting to 'student-documents'.
    """
    if not raw_bucket:
        return "student-documents"
    bucket = str(raw_bucket).strip().strip("'\"").strip()
    return bucket or "student-documents"


def infer_supabase_url_from_db():
    """
    Fallback: In case SUPABASE_URL was omitted in environment variables,
    attempts to infer project URL from the PostgreSQL DATABASE_URL.
    """
    db_url = getattr(settings, "DATABASE_URL", "") or os.environ.get("DATABASE_URL", "")
    if not db_url:
        return ""
    match = re.search(r"postgres\.([a-zA-Z0-9_-]+):", db_url)
    if match:
        return f"https://{match.group(1)}.supabase.co"
    host_match = re.search(r"@([a-zA-Z0-9_-]+)\.supabase\.co", db_url)
    if host_match:
        return f"https://{host_match.group(1)}.supabase.co"
    return ""


def get_storage_bucket_name():
    """
    Returns the sanitized Supabase Storage bucket name, defaulting to 'student-documents'.
    """
    raw_bucket = getattr(settings, "SUPABASE_STORAGE_BUCKET", "student-documents")
    return clean_bucket_name(raw_bucket)


def is_cloud_storage_configured():
    """
    Returns True if Supabase Cloud Storage credentials are fully configured.
    """
    supabase_url = clean_supabase_url(getattr(settings, "SUPABASE_URL", ""))
    if not supabase_url:
        supabase_url = infer_supabase_url_from_db()
    supabase_key = clean_supabase_key(getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", ""))
    return bool(supabase_url and supabase_key)


def get_supabase_client():
    """
    Initializes and returns the official Supabase client using server-side service role key.
    Returns None if storage is unconfigured.
    """
    if not is_cloud_storage_configured():
        return None

    supabase_url = clean_supabase_url(getattr(settings, "SUPABASE_URL", ""))
    if not supabase_url:
        supabase_url = infer_supabase_url_from_db()
    supabase_key = clean_supabase_key(getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", ""))

    try:
        from supabase import create_client
        return create_client(supabase_url, supabase_key)
    except Exception as exc:
        logger.error("Failed to initialize Supabase client for URL '%s': %s", supabase_url, str(exc))
        return None


def get_canonical_mime_type(ext, content_type=None):
    """
    Resolves standard canonical MIME type based on verified file extension,
    guaranteeing compatibility with Supabase Storage bucket MIME whitelist.
    """
    ext_norm = (ext or "").lower()
    if ext_norm in CANONICAL_MIME_TYPES:
        return CANONICAL_MIME_TYPES[ext_norm]
    if content_type and content_type != "application/octet-stream":
        return content_type
    return "application/octet-stream"


def validate_photo_file(file_obj):
    """
    Validates photograph file size, extension, and binary magic bytes.
    """
    if not file_obj:
        return None

    # Enforce size limit (3MB)
    if hasattr(file_obj, "size") and file_obj.size > PHOTO_MAX_BYTES:
        raise serializers.ValidationError("Photo file size exceeds 3MB limit.")

    # Enforce extension whitelist
    file_name = getattr(file_obj, "name", "").lower()
    ext = os.path.splitext(file_name)[1]
    if ext not in PHOTO_ALLOWED_EXTENSIONS:
        raise serializers.ValidationError("Please upload a valid image file (JPG, PNG, or WebP).")

    # Enforce MIME type if available
    content_type = getattr(file_obj, "content_type", "").lower()
    if content_type and content_type not in PHOTO_ALLOWED_MIME_TYPES:
        raise serializers.ValidationError("Please upload a valid image file (JPG, PNG, or WebP).")

    # Enforce magic bytes verification
    if hasattr(file_obj, "seek") and hasattr(file_obj, "read"):
        file_obj.seek(0)
        header = file_obj.read(16)
        file_obj.seek(0)

        is_jpeg = header[:2] == b"\xff\xd8"
        is_png = header[:8] == b"\x89PNG\r\n\x1a\n"
        is_webp = len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP"

        if not (is_jpeg or is_png or is_webp):
            raise serializers.ValidationError("Please upload a valid image file (JPG, PNG, or WebP).")

    return file_obj


def validate_resume_file(file_obj):
    """
    Validates resume file size, extension, and binary magic bytes.
    """
    if not file_obj:
        return None

    # Enforce size limit (5MB)
    if hasattr(file_obj, "size") and file_obj.size > RESUME_MAX_BYTES:
        raise serializers.ValidationError("Resume file size exceeds 5MB limit.")

    # Enforce extension whitelist
    file_name = getattr(file_obj, "name", "").lower()
    ext = os.path.splitext(file_name)[1]
    if ext not in RESUME_ALLOWED_EXTENSIONS:
        raise serializers.ValidationError("Please upload a PDF, DOC, or DOCX document.")

    # Enforce MIME type if available
    content_type = getattr(file_obj, "content_type", "").lower()
    if content_type and content_type not in RESUME_ALLOWED_MIME_TYPES:
        raise serializers.ValidationError("Please upload a PDF, DOC, or DOCX document.")

    # Enforce magic bytes verification
    if hasattr(file_obj, "seek") and hasattr(file_obj, "read"):
        file_obj.seek(0)
        header = file_obj.read(16)
        file_obj.seek(0)

        is_pdf = header[:5] == b"%PDF-"
        is_doc = header[:8] == b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"
        is_docx = header[:4] in (b"PK\x03\x04", b"PK\x05\x06", b"PK\x07\x08")

        if not (is_pdf or is_doc or is_docx):
            raise serializers.ValidationError("Please upload a PDF, DOC, or DOCX document.")

    return file_obj


def upload_file_to_supabase(file_obj, folder_prefix="documents"):
    """
    Uploads a verified file to the private Supabase storage bucket under a secure, non-guessable path.
    Returns the stored object path string.
    Raises SupabaseStorageError on upload failures with diagnostic server-side logging.
    """
    if not is_cloud_storage_configured():
        logger.error(
            "Supabase Storage upload aborted: Cloud storage is not configured. "
            "Please verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        )
        raise SupabaseStorageError(
            user_message="Cloud storage is not configured. Please register without attaching files or contact support.",
            technical_message="SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is unconfigured or invalid.",
        )

    client = get_supabase_client()
    if not client:
        logger.error("Supabase Storage client could not be initialized.")
        raise SupabaseStorageError(
            user_message="Storage service is currently unavailable. Please try again later or register without attachments.",
            technical_message="Supabase client initialization returned None.",
        )

    bucket = get_storage_bucket_name()

    # Read binary content safely
    if hasattr(file_obj, "seek") and hasattr(file_obj, "read"):
        file_obj.seek(0)
        file_bytes = file_obj.read()
        file_obj.seek(0)
    elif isinstance(file_obj, (bytes, bytearray)):
        file_bytes = bytes(file_obj)
    else:
        raise ValueError("Unsupported file format for upload.")

    # Generate cryptographically secure, non-guessable path
    ext = os.path.splitext(getattr(file_obj, "name", ""))[1].lower()
    candidate_token = uuid.uuid4().hex
    file_token = uuid.uuid4().hex
    object_path = f"{folder_prefix}/{candidate_token}/{file_token}{ext}"

    raw_content_type = getattr(file_obj, "content_type", None)
    canonical_mime = get_canonical_mime_type(ext, raw_content_type)

    try:
        client.storage.from_(bucket).upload(
            path=object_path,
            file=file_bytes,
            file_options={"content-type": canonical_mime, "upsert": "true"},
        )
        return object_path
    except Exception as exc:
        err_status = getattr(exc, "status", None) or getattr(exc, "code", None)
        err_msg = str(getattr(exc, "message", exc))

        # Log useful server-side diagnostics without leaking secrets or payload contents
        logger.error(
            "Supabase Storage upload failed for folder '%s': status=%s, bucket='%s', error=%s",
            folder_prefix,
            err_status,
            bucket,
            err_msg,
        )

        doc_name = "photograph" if folder_prefix == "photos" else "resume"
        user_msg = f"Failed to upload {doc_name} to storage. Please try again."

        status_str = str(err_status).lower() if err_status else ""
        lower_msg = err_msg.lower()

        if status_str in ("401", "403") or "unauthorized" in lower_msg or "policy" in lower_msg:
            logger.error(
                "Supabase Storage permission denied. Verify SUPABASE_SERVICE_ROLE_KEY "
                "is the secret service_role key (not anon key) and bucket RLS policies allow access."
            )
            user_msg = (
                f"Storage permission error while uploading {doc_name}. "
                "Please contact the administrator or register without attachments."
            )
        elif status_str == "404" or "not found" in lower_msg:
            logger.error("Supabase Storage bucket '%s' not found. Verify bucket name in Supabase dashboard.", bucket)
            user_msg = (
                f"Storage bucket '{bucket}' was not found. "
                "Please contact the administrator or register without attachments."
            )
        elif "mime" in lower_msg or "not allowed" in lower_msg:
            user_msg = f"Uploaded file format was rejected by storage. Please upload a standard {doc_name} file."
        elif "size" in lower_msg or "payload too large" in lower_msg or status_str == "413":
            user_msg = f"File size exceeds storage limits for {doc_name}."

        raise SupabaseStorageError(
            user_message=user_msg,
            technical_message=f"Storage upload error (status={err_status}, bucket={bucket}): {err_msg}",
            status_code=err_status,
        )


def delete_file_from_supabase(object_path):
    """
    Removes an object from the private Supabase storage bucket for atomic cleanup.
    Fails safely without raising if unconfigured or object not found.
    """
    if not object_path:
        return
    client = get_supabase_client()
    if not client:
        return

    bucket = get_storage_bucket_name()
    try:
        client.storage.from_(bucket).remove([str(object_path)])
    except Exception as exc:
        logger.warning("Failed to delete object from Supabase storage (%s): %s", object_path, str(exc))


def get_signed_file_url(object_path, expires_in=3600):
    """
    Generates a short-lived cryptographically signed URL for a private object in Supabase Storage.
    Returns None if storage is unconfigured or object_path is empty.
    """
    if not object_path:
        return None

    path_str = str(object_path).strip()
    if not path_str:
        return None

    # If already a full URL, return directly
    if path_str.startswith("http://") or path_str.startswith("https://"):
        return path_str

    client = get_supabase_client()
    if not client:
        return None

    bucket = get_storage_bucket_name()
    try:
        res = client.storage.from_(bucket).create_signed_url(path_str, expires_in=expires_in)
        raw_url = res.get("signedURL") or res.get("signedUrl")
        if not raw_url:
            return None
        if raw_url.startswith("http://") or raw_url.startswith("https://"):
            return raw_url
        supabase_url = clean_supabase_url(getattr(settings, "SUPABASE_URL", ""))
        if not supabase_url:
            supabase_url = infer_supabase_url_from_db()
        return f"{supabase_url}/storage/v1/{raw_url.lstrip('/')}"
    except Exception as exc:
        logger.warning("Failed to generate signed URL for (%s): %s", path_str, str(exc))
        return None
