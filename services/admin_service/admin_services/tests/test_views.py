from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from admin_services.models import Employee, Branch, Service, Product

class MockedAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # -------------------------
        # Sample data
        # -------------------------
        self.employee = Employee.objects.create(
            email="test@example.com",
            name="John Doe",
            role="Manager"
        )
        self.manager = Employee.objects.create(
            email="manager@example.com",
            name="Alice Manager",
            role="Manager"
        )
        self.branch = Branch.objects.create(
            name="Main Branch",
            location="City Center",
            manager=self.manager
        )
        self.service = Service.objects.create(
            name="Oil Change", description="Change engine oil", price=500
        )
        self.product = Product.objects.create(
            name="Brake Pad", description="Front brake pad", price=1500, stock=10
        )

        # -------------------------
        # Patch HasRealmAndRole.has_permission to always allow
        # -------------------------
        self.patcher_hasrealm = patch(
            "admin_services.views.HasRealmAndRole.has_permission", return_value=True
        )
        self.mock_hasrealm = self.patcher_hasrealm.start()

        # -------------------------
        # Patch send_mail and requests.post for employee creation
        # -------------------------
        self.patcher_send_mail = patch("admin_services.views.send_mail", autospec=True)
        self.mock_send_mail = self.patcher_send_mail.start()

        self.patcher_requests_post = patch("admin_services.views.requests.post", autospec=True)
        self.mock_requests_post = self.patcher_requests_post.start()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = "ok"
        self.mock_requests_post.return_value = mock_resp

    def tearDown(self):
        patch.stopall()

    # -------------------------
    # Employee tests
    # -------------------------
    def test_list_employees(self):
        url = reverse("list_employees")
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert any(emp["email"] == self.employee.email for emp in response.data)

    def test_get_employee_role(self):
        url = reverse("get_employee_role") + f"?email={self.employee.email}"
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["role"] == self.employee.role

    def test_create_employee_calls_auth_and_sends_email(self):
        url = reverse("create_employee")
        payload = {
            "email": "newuser@example.com",
            "name": "New User",
            "role": "Technician"
        }
        response = self.client.post(url, payload, format="json")
        assert response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK)
        assert self.mock_requests_post.called
        assert self.mock_send_mail.called

    def test_update_employee(self):
        url = reverse("update_employee", args=[self.employee.employee_id])
        payload = {
        "email": self.employee.email,
        "name": "Updated Name",
        "role": "Admin" 
        }
        response = self.client.put(url, payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        self.employee.refresh_from_db()
        assert self.employee.name == "Updated Name"
        assert self.employee.role == "Admin"

    def test_delete_employee(self):
        url = reverse("delete_employee", args=[self.employee.employee_id])
        response = self.client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Employee.objects.filter(employee_id=self.employee.employee_id).exists()

    # -------------------------
    # Branch tests
    # -------------------------
    def test_create_branch(self):
        url = reverse("branch_create")
        payload = {"name": "New Branch", "location": "Downtown", "manager": self.manager.employee_id}
        response = self.client.post(url, payload, format="json")
        assert response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK)
        assert response.data["name"] == "New Branch"

    def test_list_branches(self):
        url = reverse("branch_list")
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert any(b["name"] == self.branch.name for b in response.data)

    def test_update_branch(self):
        url = reverse("branch_update", args=[self.branch.branch_id])
        payload = {"name": "Updated Branch", "location": "Uptown", "manager": self.manager.employee_id}
        response = self.client.put(url, payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        self.branch.refresh_from_db()
        assert self.branch.name == "Updated Branch"

    def test_delete_branch(self):
        url = reverse("branch_delete", args=[self.branch.branch_id])
        response = self.client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Branch.objects.filter(branch_id=self.branch.branch_id).exists()

    # -------------------------
    # Service tests
    # -------------------------
    def test_create_service(self):
        url = reverse("service_create")
        payload = {"name": "Tire Change", "description": "Change tires", "price": 1000}
        response = self.client.post(url, payload, format="json")
        assert response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK)
        assert response.data["name"] == "Tire Change"

    def test_list_services(self):
        url = reverse("service_list")
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert any(s["name"] == self.service.name for s in response.data)

    def test_update_service(self):
        url = reverse("service_update", args=[self.service.service_id])
        payload = {"name": "Oil Replacement", "description": "Full oil replacement", "price": 600}
        response = self.client.put(url, payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        self.service.refresh_from_db()
        assert self.service.name == "Oil Replacement"

    def test_delete_service(self):
        url = reverse("service_delete", args=[self.service.service_id])
        response = self.client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Service.objects.filter(service_id=self.service.service_id).exists()

    # -------------------------
    # Product tests
    # -------------------------
    def test_create_product(self):
        url = reverse("product_create")
        payload = {"name": "New Product", "description": "Desc", "price": 2000, "stock": 5}
        response = self.client.post(url, payload, format="json")
        assert response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK)
        assert response.data["name"] == "New Product"

    def test_list_products(self):
        url = reverse("product_list")
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert any(p["name"] == self.product.name for p in response.data)

    def test_update_product(self):
        url = reverse("product_update", args=[self.product.product_id])
        payload = {"name": "Brake Pad Pro", "description": "Upgraded pad", "price": 1800, "stock": 15}
        response = self.client.put(url, payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        self.product.refresh_from_db()
        assert self.product.name == "Brake Pad Pro"

    def test_delete_product(self):
        url = reverse("product_delete", args=[self.product.product_id])
        response = self.client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Product.objects.filter(product_id=self.product.product_id).exists()
