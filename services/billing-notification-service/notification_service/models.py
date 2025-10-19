from django.db import models
import uuid
import datetime


class BillItem(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.name} - ${self.price}"


class Bill(models.Model):
    bill_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    customer_email = models.EmailField()
    items = models.ManyToManyField(BillItem, related_name='bills')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    # Path to stored PDF file
    pdf_path = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Bill {self.bill_id} - ${self.total_price}"


class OTP(models.Model):
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"OTP for {self.email}"

    def is_valid(self):
        now = datetime.datetime.now(self.expires_at.tzinfo)
        return not self.is_used and now < self.expires_at
