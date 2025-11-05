from django.urls import path
from .views import (
    EmployeeCreateView,
    EmployeeUpdateView,
    EmployeeDeleteView,
    get_employee_role,
    EmployeeListView,
)
from .views import (
    BranchCreateView,
    BranchListView,
    BranchUpdateView,
    BranchDeleteView,
    AvailableManagersView
)


urlpatterns = [
    path("employees/create/", EmployeeCreateView.as_view(), name="create_employee"),
    path("employees/all/", EmployeeListView.as_view(), name="create_employee"),
    path("employees/<int:employee_id>/", EmployeeUpdateView.as_view(), name="update_employee"),
    path("employees/<int:employee_id>/delete/", EmployeeDeleteView.as_view(), name="delete_employee"),
    path("employees/role/", get_employee_role, name="get_employee_role"),

    path('branches/create/', BranchCreateView.as_view(), name='branch-create'),
    path('branches/', BranchListView.as_view(), name='branch-list'),
    path('branches/<int:branch_id>/update/', BranchUpdateView.as_view(), name='branch-update'),
    path('branches/<int:branch_id>/delete/', BranchDeleteView.as_view(), name='branch-delete'),
    path('branches/managers/', AvailableManagersView.as_view(), name='available-managers'),
]
