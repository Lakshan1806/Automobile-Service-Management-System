from .permissions import HasRealmAndRole

class AdminProtectedView:
    permission_classes = [HasRealmAndRole]
    required_roles = ("ADMIN",)

class ManagerProtectedView:
    permission_classes = [HasRealmAndRole]
    required_roles = ("MANAGER",)

class AdminOrManagerProtectedView:
    permission_classes = [HasRealmAndRole]
    required_roles = ("ADMIN", "MANAGER")