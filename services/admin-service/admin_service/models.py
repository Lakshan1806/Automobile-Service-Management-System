from django.db import models
import uuid
import os

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
    
class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    def __str__(self):
        return f"{self.name} - Rs.{self.price}"
    
    # Delete old image when updating
    def save(self, *args, **kwargs):
        try:
            old_product = Product.objects.get(pk=self.pk)
            if old_product.image and old_product.image != self.image:
                if os.path.isfile(old_product.image.path):
                    os.remove(old_product.image.path)
        except Product.DoesNotExist:
            pass  # new product, no old image
        super().save(*args, **kwargs)

    # Delete image file when product is deleted
    def delete(self, *args, **kwargs):
        if self.image and os.path.isfile(self.image.path):
            os.remove(self.image.path)
        super().delete(*args, **kwargs)
