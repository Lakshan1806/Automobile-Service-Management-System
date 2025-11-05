from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee, Branch, Service
from .serializers import EmployeeSerializer, BranchSerializer, ServiceSerializer


# CREATE EMPLOYEE
class EmployeeCreateView(generics.CreateAPIView):
    serializer_class = EmployeeSerializer
    queryset = Employee.objects.all()

    def perform_create(self, serializer):
        emp = serializer.save()
        self.send_invite_email(emp)

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
