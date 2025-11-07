from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, EmployeeViewSet, VehicleViewSet, AppointmentViewSet,
    ServiceViewSet, ServiceAssignmentViewSet, TimeLogViewSet,
    ProgressUpdateViewSet, ModificationRequestViewSet, PartViewSet,
    ServicePartViewSet, NotificationViewSet,
    CustomerDashboardView, EmployeeDashboardView, AdminDashboardView
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'service-assignments', ServiceAssignmentViewSet,
                basename='service-assignment')
router.register(r'time-logs', TimeLogViewSet, basename='time-log')
router.register(r'progress-updates', ProgressUpdateViewSet,
                basename='progress-update')
router.register(r'modification-requests',
                ModificationRequestViewSet, basename='modification-request')
router.register(r'parts', PartViewSet, basename='part')
router.register(r'service-parts', ServicePartViewSet, basename='service-part')
router.register(r'notifications', NotificationViewSet, basename='notification')

# URL patterns
urlpatterns = [
    # Dashboard endpoints
    path('dashboard/customer/', CustomerDashboardView.as_view(),
         name='customer-dashboard'),
    path('dashboard/employee/', EmployeeDashboardView.as_view(),
         name='employee-dashboard'),
    path('dashboard/admin/', AdminDashboardView.as_view(), name='admin-dashboard'),

    # Router URLs
    path('', include(router.urls)),
]
