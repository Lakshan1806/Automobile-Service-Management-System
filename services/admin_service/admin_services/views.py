import logging
import requests
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee, Branch, Service, Product
from .serializers import EmployeeSerializer, BranchSerializer, ServiceSerializer, ProductSerializer
from core_auth.mixins import AdminProtectedView,ManagerProtectedView,AdminOrManagerProtectedView


logger = logging.getLogger(__name__)

# CREATE EMPLOYEE
class EmployeeCreateView(AdminProtectedView, generics.CreateAPIView):
    serializer_class = EmployeeSerializer
    queryset = Employee.objects.all()

    def perform_create(self, serializer):
        emp = serializer.save()
        self.sync_employee_account(emp)
        self.send_invite_email(emp)

    def sync_employee_account(self, emp):
        payload = {
            "employeeId": emp.employee_id,
            "email": emp.email,
            "role": emp.role,
            "inviteToken": str(emp.invite_token),
        }
        base_url = getattr(settings, "AUTH_SERVICE_BASE_URL", None)
        if not base_url:
            logger.error("AUTH_SERVICE_BASE_URL is not configured; skipping employee account sync.")
            raise APIException("Authentication service url is not configured")

        url = f"{base_url.rstrip('/')}/api/employees/invite"
        try:
            response = requests.post(url, json=payload, timeout=10)
            if response.status_code >= 400:
                logger.error(
                    "Failed to sync employee account with authentication service: %s %s",
                    response.status_code,
                    response.text,
                )
                raise APIException("Failed to sync employee account with authentication service")
        except requests.RequestException as exc:
            logger.exception("Error syncing employee account with authentication service")
            raise APIException("Error syncing employee account with authentication service") from exc

    def send_invite_email(self, emp):
        base_url = getattr(settings, "EMPLOYEE_INVITE_BASE_URL", "http://localhost:5173/create-password")
        invite_link = f"{base_url.rstrip('/')}/{emp.invite_token}/"
        subject = "Set Up Your Novadrive Account"
        body = f"""
        <p>Hi {emp.name},</p>
        <p>Welcome to <b>Novadrive Automotive</b>!</p>
        <p>Your account has been created as a <b>{emp.role}</b>.</p>
        <p>Please set your password using the link below:</p>
        <a href="{invite_link}" target="_blank">{invite_link}</a>
        <p>This link will expire after use.</p>
        <p>Best regards,<br>Novadrive Team</p>
        """

        notification_url = getattr(settings, "NOTIFICATION_SERVICE_BASE_URL", None)
        if not notification_url:
            logger.error("Notification service URL not configured")
            raise APIException("Notification service URL not configured")

        payload = {
            "to": emp.email,
            "subject": subject,
            "body": body,
            "is_html": True
        }

        try:
            response = requests.post(notification_url, json=payload, timeout=10)
            if response.status_code >= 400:
                logger.error(
                    "Failed to send invite email via notification service: %s %s",
                    response.status_code,
                    response.text,
                )
                raise APIException("Failed to send invite email")
        except requests.RequestException as exc:
            logger.exception("Error calling notification service")
            raise APIException("Error sending invite email") from exc


# LIST ALL EMPLOYEES (with filters and search)
class EmployeeListView(AdminOrManagerProtectedView, generics.ListAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["role"]
    search_fields = ["name", "email"]

class TechnicianPublicListView(generics.ListAPIView):
    """Public endpoint to expose technicians for internal services."""
    serializer_class = EmployeeSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def get_queryset(self):
        return Employee.objects.filter(role="Technician")

# UPDATE EMPLOYEE
class EmployeeUpdateView(AdminProtectedView, generics.UpdateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    lookup_field = "employee_id"

# DELETE EMPLOYEE
class EmployeeDeleteView(AdminProtectedView, generics.DestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    lookup_field = "employee_id"

# CREATE BRANCH
class BranchCreateView(AdminProtectedView, generics.CreateAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

    def get_queryset(self):
        return Branch.objects.all()


# LIST ALL BRANCHES
class BranchListView(AdminProtectedView, generics.ListAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


# UPDATE BRANCH
class BranchUpdateView(AdminProtectedView, generics.UpdateAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    lookup_field = 'branch_id'


# DELETE BRANCH
class BranchDeleteView(AdminProtectedView, generics.DestroyAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    lookup_field = 'branch_id'


# GET AVAILABLE MANAGERS
class AvailableManagersView(AdminProtectedView, generics.ListAPIView):
    serializer_class = BranchSerializer

    def get(self, request, *args, **kwargs):
        managers = Employee.objects.filter(role="Manager")
        data = [
            {"id": m.employee_id, "name": m.name, "email": m.email}
            for m in managers
        ]
        return Response(data)
    

# CREATE SERVICE
class ServiceCreateView(AdminOrManagerProtectedView, generics.CreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


# VIEW ALL SERVICES
class ServiceListView(AdminProtectedView, generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


# UPDATE SERVICE
class ServiceUpdateView(AdminProtectedView, generics.UpdateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    lookup_field = "service_id"


# DELETE SERVICE
class ServiceDeleteView(AdminProtectedView, generics.DestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    lookup_field = "service_id"


# CREATE PRODUCT
class ProductCreateView(AdminProtectedView, generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


# VIEW ALL PRODUCTS + SEARCH + SORT
class ProductListView(AdminProtectedView, generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price']
    ordering = ['price']  # default sort by ascending price


# UPDATE PRODUCT
class ProductUpdateView(AdminProtectedView, generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'product_id'


# DELETE PRODUCT
class ProductDeleteView(AdminProtectedView, generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'product_id'
