import logging

import requests
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.exceptions import APIException
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee, Branch, Service, Product
from .serializers import EmployeeSerializer, BranchSerializer, ServiceSerializer, ProductSerializer


logger = logging.getLogger(__name__)


# CREATE EMPLOYEE
class EmployeeCreateView(generics.CreateAPIView):
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
        invite_link = f"https://auth.novadrive.com/create-password/{emp.invite_token}/"
        subject = "Set Up Your Novadrive Account"
        message = (
            f"Hi {emp.name},\n\n"
            f"Welcome to Novadrive Automotive!\n\n"
            f"Your account has been created as a {emp.role}.\n"
            f"Please set your password using the link below:\n"
            f"{invite_link}\n\n"
            "This link will expire after use.\n\n"
            "Best regards,\nNovadrive Team"
        )

        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [emp.email], fail_silently=False)


# LIST ALL EMPLOYEES (with filters and search)
class EmployeeListView(generics.ListAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["role", "is_activated"]
    search_fields = ["name", "email"]

# UPDATE EMPLOYEE
class EmployeeUpdateView(generics.UpdateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    lookup_field = "employee_id"

# DELETE EMPLOYEE
class EmployeeDeleteView(generics.DestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    lookup_field = "employee_id"

# GET ROLE BY EMAIL
@api_view(["GET"])
def get_employee_role(request):
    email = request.GET.get("email")
    if not email:
        return Response({"error": "Email required"}, status=400)
    try:
        emp = Employee.objects.get(email=email)
        return Response({
            "email": emp.email,
            "role": emp.role,
            "is_activated": emp.is_activated
        })
    except Employee.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    

# CREATE BRANCH
class BranchCreateView(generics.CreateAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

    def get_queryset(self):
        return Branch.objects.all()


# LIST ALL BRANCHES
class BranchListView(generics.ListAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


# UPDATE BRANCH
class BranchUpdateView(generics.UpdateAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    lookup_field = 'branch_id'


# DELETE BRANCH
class BranchDeleteView(generics.DestroyAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    lookup_field = 'branch_id'


# GET AVAILABLE MANAGERS
class AvailableManagersView(generics.ListAPIView):
    serializer_class = BranchSerializer

    def get(self, request, *args, **kwargs):
        managers = Employee.objects.filter(role="Manager")
        data = [
            {"id": m.employee_id, "name": m.name, "email": m.email}
            for m in managers
        ]
        return Response(data)
    

# CREATE SERVICE
class ServiceCreateView(generics.CreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


# VIEW ALL SERVICES
class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


# UPDATE SERVICE
class ServiceUpdateView(generics.UpdateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    lookup_field = "service_id"


# DELETE SERVICE
class ServiceDeleteView(generics.DestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    lookup_field = "service_id"


# CREATE PRODUCT
class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


# VIEW ALL PRODUCTS + SEARCH + SORT
class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price']
    ordering = ['price']  # default sort by ascending price


# UPDATE PRODUCT
class ProductUpdateView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'product_id'


# DELETE PRODUCT
class ProductDeleteView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'product_id'
