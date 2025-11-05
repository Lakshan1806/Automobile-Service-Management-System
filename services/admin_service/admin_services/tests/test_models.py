import pytest
from admin_services.models import Employee, Branch, Service, Product

# Fixture for employee
@pytest.fixture
def employee(db):
    return Employee.objects.create(
        name="Alice",
        email="alice@test.com",
        role="Admin"
    )

@pytest.mark.django_db
def test_create_employee():
    emp = Employee.objects.create(name="Alice", email="alice@test.com", role="Admin")
    assert emp.employee_id is not None
    assert emp.is_activated is False
    assert str(emp) == "Alice (Admin)"

@pytest.mark.django_db
def test_create_branch(employee):
    branch = Branch.objects.create(name="Main Branch", location="Colombo", manager=employee)
    assert branch.branch_id is not None
    assert str(branch) == "Main Branch - Colombo"

@pytest.mark.django_db
def test_create_service():
    service = Service.objects.create(name="Oil Change", description="Full service", price=1000.0)
    assert service.service_id is not None
    assert str(service) == "Oil Change - Rs.1000.0"

@pytest.mark.django_db
def test_create_product():
    product = Product.objects.create(name="Tire", description="Car tire", price=5000.0, stock=10)
    assert product.product_id is not None
    assert str(product) == "Tire - Rs.5000.0"
