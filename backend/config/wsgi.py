"""
WSGI config for TKRCET Job Mela 2026 Django project.

It exposes the WSGI callable as a module-level variable named ``application``.
For Vercel deployment, it also exposes ``app`` as an alias.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()

# Alias for Vercel Serverless Function entrypoint
app = application
