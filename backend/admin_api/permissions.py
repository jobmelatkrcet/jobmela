from rest_framework.permissions import BasePermission


class IsAdminUserRole(BasePermission):
    """
    Allows access only to organizers / admin users.
    Students cannot access any admin endpoints.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == "admin"
                or request.user.is_staff
                or request.user.is_superuser
            )
        )
