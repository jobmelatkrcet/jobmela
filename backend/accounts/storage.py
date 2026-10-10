import os
import uuid
import logging
from django.conf import settings
from rest_framework import serializers

logger = logging.getLogger(__name__)

PHOTO_MAX_BYTES = 3 * 1024 * 1024  # 3 MB
PHOTO_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
PHOTO_ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}

RESUME_MAX_BYTES = 5 * 1024 * 1024  # 5 MB
RESUME_ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
RESUME_ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
}


def get_storage_bucket_name():
    """
    Returns the configured Supabase Storage bucket name, defaulting to 'student-documents'.
    """
    return getattr(settings, "SUPABASE_STORAGE_BUCKET", "student-documents").strip() or "student-documents"


def is_cloud_storage_configured():
    """
    Returns True if Supabase Cloud Storage credentials are fully configured.
    """
    supabase_url = getattr(settings, "SUPABASE_URL", "").strip()
    supabase_key = getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "").strip()
    return bool(supabase_url and supabase_key)


def get_supabase_client():
    """
    Initializes and returns the official Supabase client using server-side service role key.
    Returns None if storage is unconfigured.
    """
    if not is_cloud_storage_configured():
        return None
    try:
        from supabase import create_client
        return create_client(settings.SUPABASE_URL.strip(), settings.SUPABASE_SERVICE_ROLE_KEY.strip())
    except Exception as exc:
        logger.error("Failed to initialize Supabase client: %s", str(exc))
        return None


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

        is_jpeg = header[:3] == b"\xff\xd8\xff"
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
    """
    client = get_supabase_client()
    if not client:
        raise RuntimeError("Cloud storage is not configured.")

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

    content_type = getattr(file_obj, "content_type", None) or "application/octet-stream"

    client.storage.from_(bucket).upload(
        path=object_path,
        file=file_bytes,
        file_options={"content-type": content_type, "upsert": "false"},
    )
    return object_path


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
        supabase_url = getattr(settings, "SUPABASE_URL", "").rstrip("/")
        return f"{supabase_url}/storage/v1/{raw_url.lstrip('/')}"
    except Exception as exc:
        logger.warning("Failed to generate signed URL for (%s): %s", path_str, str(exc))
        return None
