from django.urls import path
from .views import (
    EmployeeCreateView,
    EmployeeUpdateView,
    EmployeeDeleteView,
    get_employee_role,
    EmployeeListView,
)

urlpatterns = [
    path("employees/create/", EmployeeCreateView.as_view(), name="create_employee"),
    path("employees/all/", EmployeeListView.as_view(), name="create_employee"),
    path("employees/<int:employee_id>/", EmployeeUpdateView.as_view(), name="update_employee"),
    path("employees/<int:employee_id>/delete/", EmployeeDeleteView.as_view(), name="delete_employee"),
    path("employees/role/", get_employee_role, name="get_employee_role"),
]
