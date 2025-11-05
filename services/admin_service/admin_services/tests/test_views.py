from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from admin_services.models import Employee, Branch, Service, Product

class EmployeeAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.employee = Employee.objects.create(
            email="test@example.com",
            name="John Doe",
            role="Manager"
        )

    def test_list_employees(self):
        url = reverse("list_employees") 
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_get_employee_role(self):
        url = reverse("get_employee_role") + f"?email={self.employee.email}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "Manager")

class BranchAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.manager = Employee.objects.create(email="manager@example.com", name="Alice", role="Manager")
        self.branch = Branch.objects.create(name="Main Branch", location="City Center", manager=self.manager)

    def test_create_branch(self):
        url = reverse("branch_create")
        data = {"name": "New Branch", "location": "Downtown", "manager": self.manager.employee_id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Branch")

    def test_list_branches(self):
        url = reverse("branch_list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_update_branch(self):
        url = reverse("branch_update", args=[self.branch.branch_id])
        data = {"name": "Updated Branch", "location": "Uptown", "manager": self.manager.employee_id}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.branch.refresh_from_db()
        self.assertEqual(self.branch.name, "Updated Branch")

    def test_delete_branch(self):
        url = reverse("branch_delete", args=[self.branch.branch_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Branch.objects.filter(branch_id=self.branch.branch_id).exists())

class ServiceAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.service = Service.objects.create(name="Oil Change", description="Change engine oil", price=500)

    def test_create_service(self):
        url = reverse("service_create")
        data = {"name": "Tire Change", "description": "Change tires", "price": 1000}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Tire Change")

    def test_list_services(self):
        url = reverse("service_list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_update_service(self):
        url = reverse("service_update", args=[self.service.service_id])
        data = {"name": "Oil Replacement", "description": "Full oil replacement", "price": 600}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.service.refresh_from_db()
        self.assertEqual(self.service.name, "Oil Replacement")

    def test_delete_service(self):
        url = reverse("service_delete", args=[self.service.service_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(service_id=self.service.service_id).exists())


class ProductAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            name="Brake Pad", description="Front brake pad", price=1500, stock=10
        )

    def test_list_products(self):
        url = reverse("product_list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_update_product(self):
        url = reverse("product_update", args=[self.product.product_id])
        data = {"name": "Brake Pad Pro", "description": "Upgraded pad", "price": 1800, "stock": 15}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, "Brake Pad Pro")

    def test_delete_product(self):
        url = reverse("product_delete", args=[self.product.product_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(product_id=self.product.product_id).exists())
