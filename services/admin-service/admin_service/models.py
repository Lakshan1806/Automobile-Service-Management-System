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
