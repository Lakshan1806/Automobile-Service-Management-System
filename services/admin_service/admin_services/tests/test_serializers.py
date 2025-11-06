import pytest
from admin_services.models import Employee, Branch, Service, Product
from admin_services.serializers import EmployeeSerializer, BranchSerializer, ServiceSerializer, ProductSerializer
from django.core.files.uploadedfile import SimpleUploadedFile

# =========================
# Fixtures
# =========================
@pytest.fixture
def employee(db):
    return Employee.objects.create(
        name="Alice",
        email="alice@test.com",
        role="Manager"
    )

@pytest.fixture
def branch(db, employee):
    return Branch.objects.create(
        name="Branch1",
        location="Colombo",
        manager=employee
    )

@pytest.fixture
def service(db):
    return Service.objects.create(
        name="Oil Change",
        description="Full oil change service",
        price=2500.00
    )

@pytest.fixture
def product(db):
    # Dummy image file
    image = SimpleUploadedFile(name="test_image.jpg", content=b"", content_type="image/jpeg")
    return Product.objects.create(
        name="Engine Oil",
        description="Synthetic engine oil",
        price=3500.00,
        stock=10,
        image=image
    )

# =========================
# EmployeeSerializer Test
# =========================
@pytest.mark.django_db
def test_employee_serializer(employee):
    serializer = EmployeeSerializer(employee)
    data = serializer.data
    assert data["name"] == "Alice"
    assert data["email"] == "alice@test.com"
    assert data["role"] == "Manager"
    assert "invite_token" in data
    assert "is_activated" in data

# =========================
# BranchSerializer Test
# =========================
@pytest.mark.django_db
def test_branch_serializer(branch, employee):
    serializer = BranchSerializer(branch)
    data = serializer.data
    assert data["name"] == "Branch1"
    assert data["location"] == "Colombo"
    assert data["manager_name"] == employee.name
    assert data["manager_email"] == employee.email

# =========================
# ServiceSerializer Test
# =========================
@pytest.mark.django_db
def test_service_serializer(service):
    serializer = ServiceSerializer(service)
    data = serializer.data
    assert data["name"] == "Oil Change"
    assert data["description"] == "Full oil change service"
    assert float(data["price"]) == 2500.00

# =========================
# ProductSerializer Test
# =========================
@pytest.mark.django_db
def test_product_serializer(product, rf):
    # rf is the RequestFactory fixture provided by pytest-django
    serializer = ProductSerializer(product, context={"request": rf.get("/")})
    data = serializer.data
    assert data["name"] == "Engine Oil"
    assert data["description"] == "Synthetic engine oil"
    assert float(data["price"]) == 3500.00
    assert data["stock"] == 10
    # image URL should be generated
    assert data["image_url"] is not None
