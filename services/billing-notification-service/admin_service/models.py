from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


# ============================================
# USER MANAGEMENT
# ============================================

class User(AbstractUser):
    """
    Extended User model for Customers, Employees, and Admins
    """
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('employee', 'Employee'),
        ('admin', 'Admin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    profile_image = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Employee(models.Model):
    """
    Employee specific details
    """
    SPECIALIZATION_CHOICES = [
        ('mechanic', 'Mechanic'),
        ('electrician', 'Electrician'),
        ('body_work', 'Body Work Specialist'),
        ('diagnostics', 'Diagnostics Specialist'),
        ('detailing', 'Detailing Specialist'),
        ('general', 'General Service'),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    specialization = models.CharField(
        max_length=50, choices=SPECIALIZATION_CHOICES)
    hourly_rate = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    hire_date = models.DateField()
    is_available = models.BooleanField(default=True)
    current_workload = models.IntegerField(
        default=0, help_text="Number of active tasks")

    class Meta:
        db_table = 'employees'
        ordering = ['employee_id']

    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()}"


# ============================================
# VEHICLE MANAGEMENT
# ============================================

class Vehicle(models.Model):
    """
    Customer vehicles
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='vehicles')
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.IntegerField(
        validators=[MinValueValidator(1900), MaxValueValidator(2100)])
    vin = models.CharField(max_length=17, unique=True,
                           help_text="Vehicle Identification Number")
    license_plate = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=30, blank=True)
    mileage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vehicles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.year} {self.make} {self.model} - {self.license_plate}"


# ============================================
# APPOINTMENT MANAGEMENT
# ============================================

class Appointment(models.Model):
    """
    Customer appointments for vehicle services
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='appointments')
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateTimeField()
    service_type = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_employee = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_appointments')
    estimated_duration = models.DurationField(
        help_text="Estimated service duration")
    estimated_cost = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['-appointment_date']

    def __str__(self):
        return f"Appointment #{self.id} - {self.service_type} ({self.status})"


# ============================================
# SERVICE/PROJECT MANAGEMENT
# ============================================

class Service(models.Model):
    """
    Vehicle services and projects
    """
    TYPE_CHOICES = [
        ('service', 'Regular Service'),
        ('project', 'Modification Project'),
        ('repair', 'Repair'),
        ('inspection', 'Inspection'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_number = models.CharField(max_length=20, unique=True)
    service_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    appointment = models.ForeignKey(
        Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='services')
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name='services')
    customer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='services')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default='medium')
    progress_percentage = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    estimated_hours = models.DecimalField(
        max_digits=6, decimal_places=2, default=0)
    actual_hours = models.DecimalField(
        max_digits=6, decimal_places=2, default=0)
    estimated_cost = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    actual_cost = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'services'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.service_number} - {self.title}"


class ServiceAssignment(models.Model):
    """
    Assign employees to services/projects
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name='assignments')
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name='service_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_lead = models.BooleanField(
        default=False, help_text="Is this the lead employee?")

    class Meta:
        db_table = 'service_assignments'
        unique_together = ['service', 'employee']
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.employee} assigned to {self.service}"


# ============================================
# TIME TRACKING
# ============================================

class TimeLog(models.Model):
    """
    Employee time logs for services/projects
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name='time_logs')
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name='time_logs')
    description = models.TextField(help_text="What work was done")
    hours = models.DecimalField(
        max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
    log_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'time_logs'
        ordering = ['-log_date', '-created_at']

    def __str__(self):
        return f"{self.employee} - {self.hours}hrs on {self.log_date}"


# ============================================
# PROGRESS TRACKING
# ============================================

class ProgressUpdate(models.Model):
    """
    Track progress updates for services/projects
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name='progress_updates')
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name='progress_updates')
    update_text = models.TextField()
    progress_percentage = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)])
    images = models.JSONField(default=list, blank=True,
                              help_text="List of image URLs")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'progress_updates'
        ordering = ['-created_at']

    def __str__(self):
        return f"Update for {self.service} - {self.progress_percentage}%"


# ============================================
# MODIFICATION REQUESTS
# ============================================

class ModificationRequest(models.Model):
    """
    Customer modification/project requests
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='modification_requests')
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name='modification_requests')
    title = models.CharField(max_length=200)
    description = models.TextField()
    modification_type = models.CharField(max_length=100)
    budget_range = models.CharField(
        max_length=50, help_text="e.g., $1000-$5000")
    preferred_start_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    service = models.OneToOneField(
        Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='modification_request')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'modification_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.customer.username}"


# ============================================
# PARTS & INVENTORY
# ============================================

class Part(models.Model):
    """
    Parts used in services
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    part_number = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_in_stock = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'parts'
        ordering = ['part_number']

    def __str__(self):
        return f"{self.part_number} - {self.name}"


class ServicePart(models.Model):
    """
    Parts used in a service
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name='parts_used')
    part = models.ForeignKey(
        Part, on_delete=models.CASCADE, related_name='used_in_services')
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'service_parts'
        ordering = ['-added_at']

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.part.name} x{self.quantity} for {self.service}"


# ============================================
# NOTIFICATIONS
# ============================================

class Notification(models.Model):
    """
    User notifications
    """
    TYPE_CHOICES = [
        ('appointment', 'Appointment'),
        ('service', 'Service Update'),
        ('payment', 'Payment'),
        ('general', 'General'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"
