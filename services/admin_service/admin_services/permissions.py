from __future__ import annotations

from rest_framework.permissions import BasePermission


class HasRealmAndRole(BasePermission):
    """Allow access when the authenticated principal matches required realm/roles."""

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view) -> bool:
        principal = getattr(request, "user", None)
        if not getattr(principal, "is_authenticated", False):
            return False

        required_realm = getattr(view, "required_realm", "employees")
        required_roles = getattr(view, "required_roles", ("ADMIN",))

        if required_realm and getattr(principal, "realm", None) != required_realm:
            return False

        user_roles = {role.upper() for role in getattr(principal, "roles", [])}
        for role in required_roles:
            if role.upper() in user_roles:
                return True
        return False
