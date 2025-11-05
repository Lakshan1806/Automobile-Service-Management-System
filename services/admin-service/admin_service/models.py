from django.db import models
import uuid

class Employee(models.Model):
    ROLE_CHOICES = [
        ("Admin", "Admin"),
        ("Manager", "Manager"),
        ("Technician", "Technician"),
        ("Driver", "Driver"),
    ]

    employee_id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    invite_token = models.UUIDField(default=uuid.uuid4, editable=False)
    is_activated = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.role})"
    

class Branch(models.Model):
    branch_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    manager = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'Manager'},  # only show employees with Manager role
        related_name="managed_branches"
    )

    def __str__(self):
        return f"{self.name} - {self.location}"
    
    
class Service(models.Model):
    service_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} - Rs.{self.price}"
