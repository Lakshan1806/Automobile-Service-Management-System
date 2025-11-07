from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    User, Employee, Vehicle, Appointment, Service, ServiceAssignment,
    TimeLog, ProgressUpdate, ModificationRequest, Part, ServicePart, Notification
)

User = get_user_model()


# ============================================
# USER SERIALIZERS
# ============================================

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'address', 'profile_image', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users"""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'role', 'phone', 'address'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model"""
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'user_id', 'employee_id', 'specialization',
            'hourly_rate', 'hire_date', 'is_available', 'current_workload'
        ]
        read_only_fields = ['current_workload']


# ============================================
# VEHICLE SERIALIZERS
# ============================================

class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle model"""
    customer_name = serializers.CharField(
        source='customer.get_full_name', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'customer', 'customer_name', 'make', 'model', 'year',
            'vin', 'license_plate', 'color', 'mileage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================================
# APPOINTMENT SERIALIZERS
# ============================================

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for Appointment model"""
    customer_name = serializers.CharField(
        source='customer.get_full_name', read_only=True)
    vehicle_info = serializers.SerializerMethodField()
    employee_name = serializers.CharField(
        source='assigned_employee.user.get_full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'customer', 'customer_name', 'vehicle', 'vehicle_info',
            'appointment_date', 'service_type', 'description', 'status',
            'assigned_employee', 'employee_name', 'estimated_duration',
            'estimated_cost', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_vehicle_info(self, obj):
        return f"{obj.vehicle.year} {obj.vehicle.make} {obj.vehicle.model}"


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments"""
    class Meta:
        model = Appointment
        fields = [
            'customer', 'vehicle', 'appointment_date', 'service_type',
            'description', 'estimated_duration', 'estimated_cost'
        ]


# ============================================
# SERVICE SERIALIZERS
# ============================================

class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model"""
    customer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), pk_field=serializers.UUIDField())
    vehicle = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(), pk_field=serializers.UUIDField())
    appointment = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.all(), pk_field=serializers.UUIDField(), allow_null=True)
    customer_name = serializers.CharField(
        source='customer.get_full_name', read_only=True)
    vehicle_info = serializers.SerializerMethodField()
    assigned_employees = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 'service_number', 'service_type', 'appointment', 'vehicle',
            'vehicle_info', 'customer', 'customer_name', 'title', 'description',
            'status', 'priority', 'progress_percentage', 'estimated_hours',
            'actual_hours', 'estimated_cost', 'actual_cost', 'start_date',
            'end_date', 'assigned_employees', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'service_number', 'created_at', 'updated_at']

    def get_vehicle_info(self, obj):
        return f"{obj.vehicle.year} {obj.vehicle.make} {obj.vehicle.model}"

    def get_assigned_employees(self, obj):
        assignments = obj.assignments.select_related('employee__user')
        return [
            {
                'employee_id': str(assignment.employee.id),
                'name': assignment.employee.user.get_full_name(),
                'is_lead': assignment.is_lead
            }
            for assignment in assignments
        ]


class ServiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating services"""
    class Meta:
        model = Service
        fields = [
            'service_type', 'vehicle', 'customer', 'title', 'description',
            'priority', 'estimated_hours', 'estimated_cost'
        ]


class ServiceAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for Service Assignment"""
    employee_name = serializers.CharField(
        source='employee.user.get_full_name', read_only=True)
    service_title = serializers.CharField(
        source='service.title', read_only=True)

    class Meta:
        model = ServiceAssignment
        fields = [
            'id', 'service', 'service_title', 'employee', 'employee_name',
            'is_lead', 'assigned_at'
        ]
        read_only_fields = ['id', 'assigned_at']


# ============================================
# TIME LOG SERIALIZERS
# ============================================

class TimeLogSerializer(serializers.ModelSerializer):
    """Serializer for Time Log"""
    employee_name = serializers.CharField(
        source='employee.user.get_full_name', read_only=True)
    service_title = serializers.CharField(
        source='service.title', read_only=True)

    class Meta:
        model = TimeLog
        fields = [
            'id', 'employee', 'employee_name', 'service', 'service_title',
            'description', 'hours', 'log_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TimeLogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating time logs"""
    class Meta:
        model = TimeLog
        fields = ['employee', 'service', 'description', 'hours', 'log_date']

    def validate_hours(self, value):
        if value <= 0:
            raise serializers.ValidationError("Hours must be greater than 0")
        if value > 24:
            raise serializers.ValidationError(
                "Hours cannot exceed 24 in a day")
        return value


# ============================================
# PROGRESS UPDATE SERIALIZERS
# ============================================

class ProgressUpdateSerializer(serializers.ModelSerializer):
    """Serializer for Progress Update"""
    employee_name = serializers.CharField(
        source='employee.user.get_full_name', read_only=True)
    service_title = serializers.CharField(
        source='service.title', read_only=True)

    class Meta:
        model = ProgressUpdate
        fields = [
            'id', 'service', 'service_title', 'employee', 'employee_name',
            'update_text', 'progress_percentage', 'images', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProgressUpdateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating progress updates"""
    class Meta:
        model = ProgressUpdate
        fields = ['service', 'employee', 'update_text',
                  'progress_percentage', 'images']


# ============================================
# MODIFICATION REQUEST SERIALIZERS
# ============================================

class ModificationRequestSerializer(serializers.ModelSerializer):
    """Serializer for Modification Request"""
    customer_name = serializers.CharField(
        source='customer.get_full_name', read_only=True)
    vehicle_info = serializers.SerializerMethodField()
    service_id = serializers.UUIDField(source='service.id', read_only=True)

    class Meta:
        model = ModificationRequest
        fields = [
            'id', 'customer', 'customer_name', 'vehicle', 'vehicle_info',
            'title', 'description', 'modification_type', 'budget_range',
            'preferred_start_date', 'status', 'admin_notes', 'service_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_vehicle_info(self, obj):
        return f"{obj.vehicle.year} {obj.vehicle.make} {obj.vehicle.model}"


class ModificationRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating modification requests"""
    class Meta:
        model = ModificationRequest
        fields = [
            'customer', 'vehicle', 'title', 'description',
            'modification_type', 'budget_range', 'preferred_start_date'
        ]


# ============================================
# PART SERIALIZERS
# ============================================

class PartSerializer(serializers.ModelSerializer):
    """Serializer for Part"""
    needs_reorder = serializers.SerializerMethodField()

    class Meta:
        model = Part
        fields = [
            'id', 'part_number', 'name', 'description', 'unit_price',
            'quantity_in_stock', 'reorder_level', 'needs_reorder',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_needs_reorder(self, obj):
        return obj.quantity_in_stock <= obj.reorder_level


class ServicePartSerializer(serializers.ModelSerializer):
    """Serializer for Service Part"""
    part_name = serializers.CharField(source='part.name', read_only=True)
    part_number = serializers.CharField(
        source='part.part_number', read_only=True)

    class Meta:
        model = ServicePart
        fields = [
            'id', 'service', 'part', 'part_name', 'part_number',
            'quantity', 'unit_price', 'total_price', 'added_at'
        ]
        read_only_fields = ['id', 'total_price', 'added_at']


# ============================================
# NOTIFICATION SERIALIZERS
# ============================================

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification"""
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), pk_field=serializers.UUIDField())

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'title', 'message',
            'is_read', 'link', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# ============================================
# DASHBOARD SERIALIZERS
# ============================================

class CustomerDashboardSerializer(serializers.Serializer):
    """Serializer for Customer Dashboard data"""
    total_vehicles = serializers.IntegerField()
    active_services = serializers.IntegerField()
    upcoming_appointments = serializers.IntegerField()
    pending_modifications = serializers.IntegerField()
    recent_services = ServiceSerializer(many=True)
    notifications = NotificationSerializer(many=True)


class EmployeeDashboardSerializer(serializers.Serializer):
    """Serializer for Employee Dashboard data"""
    active_tasks = serializers.IntegerField()
    total_hours_logged = serializers.DecimalField(
        max_digits=10, decimal_places=2)
    upcoming_appointments = serializers.IntegerField()
    current_workload = serializers.IntegerField()
    assigned_services = ServiceSerializer(many=True)
    recent_time_logs = TimeLogSerializer(many=True)


class AdminDashboardSerializer(serializers.Serializer):
    """Serializer for Admin Dashboard data"""
    total_customers = serializers.IntegerField()
    total_employees = serializers.IntegerField()
    active_services = serializers.IntegerField()
    pending_appointments = serializers.IntegerField()
    pending_modifications = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    recent_services = ServiceSerializer(many=True)
    employee_workloads = serializers.ListField()
