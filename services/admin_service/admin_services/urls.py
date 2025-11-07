from django.urls import path
from .views import (
    EmployeeCreateView,
    EmployeeUpdateView,
    EmployeeDeleteView,
    EmployeeListView,
    EmployeeRoleView,
)
from .views import (
    BranchCreateView,
    BranchListView,
    BranchUpdateView,
    BranchDeleteView,
    AvailableManagersView
)
from .views import (
    ServiceCreateView,
    ServiceListView,
    ServiceUpdateView,
    ServiceDeleteView,
)
from .views import (
    ProductCreateView,
    ProductListView,
    ProductUpdateView,
    ProductDeleteView,
)


urlpatterns = [
    path("employees/create/", EmployeeCreateView.as_view(), name="create_employee"),
    path("employees/all/", EmployeeListView.as_view(), name="list_employees"),
    path("employees/<int:employee_id>/", EmployeeUpdateView.as_view(), name="update_employee"),
    path("employees/<int:employee_id>/delete/", EmployeeDeleteView.as_view(), name="delete_employee"),
    path("employees/role/", EmployeeRoleView.as_view(), name="get_employee_role"),

    path('branches/create/', BranchCreateView.as_view(), name='branch_create'),
    path('branches/', BranchListView.as_view(), name='branch_list'),
    path('branches/<int:branch_id>/update/', BranchUpdateView.as_view(), name='branch_update'),
    path('branches/<int:branch_id>/delete/', BranchDeleteView.as_view(), name='branch_delete'),
    path('branches/managers/', AvailableManagersView.as_view(), name='available_managers'),

    path("services/create/", ServiceCreateView.as_view(), name="service_create"),
    path("services/", ServiceListView.as_view(), name="service_list"),
    path("services/<int:service_id>/update/", ServiceUpdateView.as_view(), name="service_update"),
    path("services/<int:service_id>/delete/", ServiceDeleteView.as_view(), name="service_delete"),

    path('products/create/', ProductCreateView.as_view(), name='product_create'),
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<int:product_id>/update/', ProductUpdateView.as_view(), name='product_update'),
    path('products/<int:product_id>/delete/', ProductDeleteView.as_view(), name='product_delete'),
]
