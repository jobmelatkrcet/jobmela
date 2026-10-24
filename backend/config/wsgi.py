"""
WSGI config for TKRCET Job Mela 2026 Django project.

It exposes the WSGI callable as a module-level variable named ``application``.
For Vercel deployment, it also exposes ``app`` as an alias.
"""

import os
import logging
from django.core.wsgi import get_wsgi_application

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()

# Alias for Vercel Serverless Function entrypoint
app = application

# Automatically apply pending migrations on container boot
try:
    from django.core.management import call_command
    call_command("migrate", interactive=False)
except Exception as migrate_err:
    logger.warning("Auto-migration during WSGI startup skipped or failed: %s", migrate_err)

