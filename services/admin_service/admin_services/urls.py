from django.urls import path
from .views import (
    EmployeeCreateView,
    EmployeeUpdateView,
    EmployeeDeleteView,
    EmployeeListView,
    TechnicianPublicListView,
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
    ServiceListPublicView,
    ServiceDetailPublicView,
)
from .views import (
    ProductCreateView,
    ProductListView,
    ProductUpdateView,
    ProductDeleteView,
    ProductListPublicView,
    ProductDetailPublicView,
    ProductStockUpdatePublicView,
)

urlpatterns = [
    path("employees/create/", EmployeeCreateView.as_view(), name="create_employee"),
    path("employees/all/", EmployeeListView.as_view(), name="list_employees"),
    path("employees/<int:employee_id>/", EmployeeUpdateView.as_view(), name="update_employee"),
    path("employees/<int:employee_id>/delete/", EmployeeDeleteView.as_view(), name="delete_employee"),
    path("employees/role/", EmployeeRoleView.as_view(), name="get_employee_role"),
    path("technicians/", TechnicianPublicListView.as_view(), name="public_list_technicians"),

    path('branches/create/', BranchCreateView.as_view(), name='branch_create'),
    path('branches/', BranchListView.as_view(), name='branch_list'),
    path('branches/<int:branch_id>/update/', BranchUpdateView.as_view(), name='branch_update'),
    path('branches/<int:branch_id>/delete/', BranchDeleteView.as_view(), name='branch_delete'),
    path('branches/managers/', AvailableManagersView.as_view(), name='available_managers'),

    path("services/create/", ServiceCreateView.as_view(), name="service_create"),
    path("services/", ServiceListView.as_view(), name="service_list"),
    path("services/<int:service_id>/update/", ServiceUpdateView.as_view(), name="service_update"),
    path("services/<int:service_id>/delete/", ServiceDeleteView.as_view(), name="service_delete"),
    
    # Public endpoints for technician-service
    path("public/services/", ServiceListPublicView.as_view(), name="service_list_public"),
    path("public/services/<int:service_id>/", ServiceDetailPublicView.as_view(), name="service_detail_public"),

    path('products/create/', ProductCreateView.as_view(), name='product_create'),
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<int:product_id>/update/', ProductUpdateView.as_view(), name='product_update'),
    path('products/<int:product_id>/delete/', ProductDeleteView.as_view(), name='product_delete'),
    
    # Public endpoints for technician-service
    path('public/products/', ProductListPublicView.as_view(), name='product_list_public'),
    path('public/products/<int:product_id>/', ProductDetailPublicView.as_view(), name='product_detail_public'),
    path('public/products/<int:product_id>/stock/', ProductStockUpdatePublicView.as_view(), name='product_stock_update_public'),
]

