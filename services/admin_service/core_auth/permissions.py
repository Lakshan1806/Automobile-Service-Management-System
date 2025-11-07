from rest_framework.permissions import BasePermission

class HasRealmAndRole(BasePermission):
    """Check if the authenticated principal has the required realm and roles."""
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view) -> bool:
        principal = getattr(request, "user", None)
        if not getattr(principal, "is_authenticated", False):
            return False

        required_realm = getattr(view, "required_realm", None)
        required_roles = getattr(view, "required_roles", ())

        if required_realm and getattr(principal, "realm", None) != required_realm:
            return False

        user_roles = {role.upper() for role in getattr(principal, "roles", [])}
        return any(role.upper() in user_roles for role in required_roles)
