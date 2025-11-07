from .permissions import HasRealmAndRole

class AdminProtectedView:
    permission_classes = [HasRealmAndRole]
    required_roles = ("ADMIN",)
    required_realm = "employees"

class ManagerProtectedView:
    permission_classes = [HasRealmAndRole]
    required_roles = ("MANAGER",)
    required_realm = "employees"

class AdminOrManagerProtectedView:
    permission_classes = [HasRealmAndRole]
    required_roles = ("ADMIN", "MANAGER")
    required_realm = "employees"

class CustomerProtectedView:
    permission_classes = [HasRealmAndRole]
    required_roles = ("CUSTOMER",)
    required_realm = "customers"