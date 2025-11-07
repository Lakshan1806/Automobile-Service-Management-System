from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Employee, Vehicle, Appointment, Service, ServiceAssignment,
    TimeLog, ProgressUpdate, ModificationRequest, Part, ServicePart, Notification
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model"""
    list_display = ('username', 'email', 'first_name',
                    'last_name', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-created_at',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'phone',
         'address', 'profile_image', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    """Admin configuration for Employee model"""
    list_display = ('employee_id', 'get_name', 'specialization',
                    'hire_date', 'is_available', 'current_workload')
    list_filter = ('is_available', 'specialization', 'hire_date')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name')
    # Employee model doesn't have created_at/updated_at fields

    def get_name(self, obj):
        return obj.user.get_full_name()
    get_name.short_description = 'Name'


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """Admin configuration for Vehicle model"""
    list_display = ('get_vehicle_name', 'year', 'vin',
                    'license_plate', 'get_customer', 'created_at')
    list_filter = ('year', 'make')
    search_fields = ('make', 'model', 'vin',
                     'license_plate', 'customer__username')
    readonly_fields = ('created_at', 'updated_at')

    def get_vehicle_name(self, obj):
        return f"{obj.year} {obj.make} {obj.model}"
    get_vehicle_name.short_description = 'Vehicle'

    def get_customer(self, obj):
        return obj.customer.get_full_name() if obj.customer else '-'
    get_customer.short_description = 'Customer'


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Admin configuration for Appointment model"""
    list_display = ('get_customer', 'service_type',
                    'appointment_date', 'status', 'created_at')
    list_filter = ('status', 'service_type', 'appointment_date')
    search_fields = ('customer__username', 'vehicle__make', 'vehicle__model')
    readonly_fields = ('created_at', 'updated_at')

    def get_customer(self, obj):
        return obj.customer.get_full_name()
    get_customer.short_description = 'Customer'


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """Admin configuration for Service model"""
    list_display = ('service_number', 'title', 'service_type',
                    'status', 'priority', 'progress_percentage', 'created_at')
    list_filter = ('status', 'service_type', 'priority')
    search_fields = ('service_number', 'title', 'customer__username')
    readonly_fields = ('service_number', 'created_at', 'updated_at')

    fieldsets = (
        ('Basic Information', {
            'fields': ('service_number', 'service_type', 'vehicle', 'customer')
        }),
        ('Service Details', {
            'fields': ('title', 'description', 'status', 'priority')
        }),
        ('Timing & Progress', {
            'fields': ('start_date', 'end_date', 'estimated_hours', 'actual_hours', 'progress_percentage')
        }),
        ('Cost', {
            'fields': ('estimated_cost', 'actual_cost')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ServiceAssignment)
class ServiceAssignmentAdmin(admin.ModelAdmin):
    """Admin configuration for Service Assignment"""
    list_display = ('get_service', 'get_employee', 'assigned_at', 'is_lead')
    list_filter = ('is_lead', 'assigned_at')
    search_fields = ('service__service_number', 'employee__user__username')

    def get_service(self, obj):
        return obj.service.service_number
    get_service.short_description = 'Service'

    def get_employee(self, obj):
        return obj.employee.user.get_full_name()
    get_employee.short_description = 'Employee'


@admin.register(TimeLog)
class TimeLogAdmin(admin.ModelAdmin):
    """Admin configuration for Time Log"""
    list_display = ('get_employee', 'get_service',
                    'log_date', 'hours', 'created_at')
    list_filter = ('log_date',)
    search_fields = ('employee__user__username',
                     'service__service_number', 'description')
    readonly_fields = ('created_at', 'updated_at')

    def get_employee(self, obj):
        return obj.employee.user.get_full_name()
    get_employee.short_description = 'Employee'

    def get_service(self, obj):
        return obj.service.service_number
    get_service.short_description = 'Service'


@admin.register(ProgressUpdate)
class ProgressUpdateAdmin(admin.ModelAdmin):
    """Admin configuration for Progress Update"""
    list_display = ('get_service', 'progress_percentage',
                    'get_employee', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('service__service_number', 'update_text')
    readonly_fields = ('created_at',)

    def get_service(self, obj):
        return obj.service.service_number
    get_service.short_description = 'Service'

    def get_employee(self, obj):
        return obj.employee.user.get_full_name()
    get_employee.short_description = 'Employee'
    get_employee.short_description = 'Employee'


@admin.register(ModificationRequest)
class ModificationRequestAdmin(admin.ModelAdmin):
    """Admin configuration for Modification Request"""
    list_display = ('title', 'modification_type', 'get_customer',
                    'status', 'budget_range', 'created_at')
    list_filter = ('status', 'modification_type')
    search_fields = ('title', 'customer__username', 'vehicle__make')
    readonly_fields = ('created_at', 'updated_at')

    def get_customer(self, obj):
        return obj.customer.get_full_name()
    get_customer.short_description = 'Customer'


@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    """Admin configuration for Part"""
    list_display = ('part_number', 'name', 'quantity_in_stock',
                    'reorder_level', 'unit_price', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('part_number', 'name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ServicePart)
class ServicePartAdmin(admin.ModelAdmin):
    """Admin configuration for Service Part"""
    list_display = ('get_service', 'get_part', 'quantity',
                    'unit_price', 'total_price')
    search_fields = ('service__service_number', 'part__part_number')

    def get_service(self, obj):
        return obj.service.service_number
    get_service.short_description = 'Service'

    def get_part(self, obj):
        return obj.part.name
    get_part.short_description = 'Part'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin configuration for Notification"""
    list_display = ('get_user', 'notification_type',
                    'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'notification_type', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    readonly_fields = ('created_at',)

    def get_user(self, obj):
        return obj.user.username
    get_user.short_description = 'User'
