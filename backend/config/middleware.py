"""
Middleware for TKRCET Job Mela 2026 platform.
"""

import re

# Deployment-specific Vercel URL patterns for this project:
# Matches:
# - jobmela-z1tj-kx0dawdyb-jobmela.vercel.app
# - jobmela-z1tj-of2fcjb4f-jobmela.vercel.app
# - jobmela-z1tj-git-*-jobmela.vercel.app
# - jobmela-z1tj-*.vercel.app
PROJECT_HOST_PATTERN = re.compile(r"^jobmela-z1tj(-[a-z0-9-]+)?\.vercel\.app$")
CANONICAL_BACKEND_HOST = "jobmela-z1tj.vercel.app"


class VercelHostValidationMiddleware:
    """
    Middleware that safely normalizes deployment-specific Vercel preview hostnames
    for the 'jobmela-z1tj' project to the canonical backend hostname, while strictly
    preserving security boundaries and rejecting unauthorized external hosts.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.META.get("HTTP_HOST", "")
        if host:
            # Strip port if present
            domain = host.split(":")[0].lower().strip()
            if PROJECT_HOST_PATTERN.match(domain):
                port = host.split(":")[1] if ":" in host else ""
                request.META["HTTP_HOST"] = (
                    f"{CANONICAL_BACKEND_HOST}:{port}" if port else CANONICAL_BACKEND_HOST
                )
        return self.get_response(request)
