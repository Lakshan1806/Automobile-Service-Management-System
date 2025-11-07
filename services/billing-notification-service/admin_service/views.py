from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
import logging

from .models import (
    User, Employee, Vehicle, Appointment, Service, ServiceAssignment,
    TimeLog, ProgressUpdate, ModificationRequest, Part, ServicePart, Notification
)
from .serializers import (
    UserSerializer, UserCreateSerializer, EmployeeSerializer,
    VehicleSerializer, AppointmentSerializer, AppointmentCreateSerializer,
    ServiceSerializer, ServiceCreateSerializer, ServiceAssignmentSerializer,
    TimeLogSerializer, TimeLogCreateSerializer,
    ProgressUpdateSerializer, ProgressUpdateCreateSerializer,
    ModificationRequestSerializer, ModificationRequestCreateSerializer,
    PartSerializer, ServicePartSerializer, NotificationSerializer,
    CustomerDashboardSerializer, EmployeeDashboardSerializer, AdminDashboardSerializer
)

logger = logging.getLogger(__name__)


# ============================================
# CUSTOM PERMISSIONS
# ============================================

class IsCustomer(IsAuthenticated):
    """Permission for customers only"""

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'customer'


class IsEmployee(IsAuthenticated):
    """Permission for employees only"""

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'employee'


class IsAdmin(IsAuthenticated):
    """Permission for admins only"""

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'admin'


# ============================================
# USER MANAGEMENT VIEWS
# ============================================

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User management"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'username']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdmin()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def customers(self, request):
        """Get all customers"""
        customers = User.objects.filter(role='customer')
        serializer = self.get_serializer(customers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def employees_list(self, request):
        """Get all employees"""
        employees = User.objects.filter(role='employee')
        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)


class EmployeeViewSet(viewsets.ModelViewSet):
    """ViewSet for Employee management"""
    queryset = Employee.objects.select_related('user').all()
    serializer_class = EmployeeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee_id', 'user__first_name',
                     'user__last_name', 'specialization']
    ordering_fields = ['hire_date', 'employee_id']

    @action(detail=True, methods=['get'])
    def workload(self, request, pk=None):
        """Get employee's current workload"""
        employee = self.get_object()
        active_services = Service.objects.filter(
            assignments__employee=employee,
            status__in=['pending', 'in_progress']
        ).count()

        return Response({
            'employee_id': str(employee.id),
            'employee_name': employee.user.get_full_name(),
            'current_workload': active_services,
            'is_available': employee.is_available
        })


# ============================================
# VEHICLE VIEWS
# ============================================

class VehicleViewSet(viewsets.ModelViewSet):
    """ViewSet for Vehicle management"""
    queryset = Vehicle.objects.select_related('customer').all()
    serializer_class = VehicleSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['make', 'model', 'vin', 'license_plate']
    ordering_fields = ['created_at', 'year']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Vehicle.objects.none()
        if user.role == 'customer':
            return Vehicle.objects.filter(customer=user)
        return Vehicle.objects.all()

    @action(detail=True, methods=['get'])
    def service_history(self, request, pk=None):
        """Get service history for a vehicle"""
        vehicle = self.get_object()
        services = Service.objects.filter(
            vehicle=vehicle).order_by('-created_at')
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)


# ============================================
# APPOINTMENT VIEWS
# ============================================

class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Appointment management"""
    queryset = Appointment.objects.select_related(
        'customer', 'vehicle', 'assigned_employee').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['service_type', 'customer__username']
    ordering_fields = ['appointment_date', 'created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Appointment.objects.none()
        if user.role == 'customer':
            return Appointment.objects.filter(customer=user)
        elif user.role == 'employee':
            return Appointment.objects.filter(assigned_employee__user=user)
        return Appointment.objects.all()

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming appointments"""
        now = timezone.now()
        upcoming = self.get_queryset().filter(
            appointment_date__gte=now,
            status__in=['pending', 'confirmed']
        ).order_by('appointment_date')
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm an appointment"""
        appointment = self.get_object()
        appointment.status = 'confirmed'
        appointment.save()
        return Response({'message': 'Appointment confirmed', 'status': appointment.status})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        return Response({'message': 'Appointment cancelled', 'status': appointment.status})


# ============================================
# SERVICE VIEWS
# ============================================

class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet for Service/Project management"""
    queryset = Service.objects.select_related(
        'vehicle', 'customer').prefetch_related('assignments').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['service_number', 'title', 'customer__username']
    ordering_fields = ['created_at', 'priority', 'status']

    def get_serializer_class(self):
        if self.action == 'create':
            return ServiceCreateSerializer
        return ServiceSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Service.objects.none()
        if user.role == 'customer':
            return Service.objects.filter(customer=user)
        elif user.role == 'employee':
            return Service.objects.filter(assignments__employee__user=user)
        return Service.objects.all()

    def perform_create(self, serializer):
        # Generate service number
        last_service = Service.objects.order_by('-created_at').first()
        if last_service and last_service.service_number:
            last_number = int(last_service.service_number.split('-')[1])
            new_number = f"SRV-{last_number + 1:05d}"
        else:
            new_number = "SRV-00001"

        serializer.save(service_number=new_number)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active services"""
        active = self.get_queryset().filter(
            status__in=['pending', 'in_progress'])
        serializer = self.get_serializer(active, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update service status - Admins and assigned employees can update"""
        service = self.get_object()
        user = request.user

        # Check permissions: Admin or Employee assigned to this service
        if user.role == 'employee':
            try:
                employee = Employee.objects.get(user=user)
                # Check if employee is assigned to this service
                is_assigned = ServiceAssignment.objects.filter(
                    service=service,
                    employee=employee
                ).exists()

                if not is_assigned:
                    return Response(
                        {'error': 'You are not assigned to this service'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Employee.DoesNotExist:
                return Response(
                    {'error': 'Employee profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif user.role != 'admin':
            return Response(
                {'error': 'Only employees and admins can update service status'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')

        if new_status not in dict(Service.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        service.status = new_status
        if new_status == 'in_progress' and not service.start_date:
            service.start_date = timezone.now()
        elif new_status == 'completed':
            service.end_date = timezone.now()
            service.progress_percentage = 100

        service.save()
        return Response({'message': 'Status updated', 'status': service.status})

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update service progress - Employees can update their assigned services"""
        service = self.get_object()
        user = request.user

        # Check permissions: Admin or Employee assigned to this service
        if user.role == 'employee':
            try:
                employee = Employee.objects.get(user=user)
                # Check if employee is assigned to this service
                is_assigned = ServiceAssignment.objects.filter(
                    service=service,
                    employee=employee
                ).exists()

                if not is_assigned:
                    return Response(
                        {'error': 'You are not assigned to this service'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Employee.DoesNotExist:
                return Response(
                    {'error': 'Employee profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif user.role != 'admin':
            return Response(
                {'error': 'Only employees and admins can update service progress'},
                status=status.HTTP_403_FORBIDDEN
            )

        progress = request.data.get('progress_percentage')

        if not isinstance(progress, int) or progress < 0 or progress > 100:
            return Response({'error': 'Progress must be between 0 and 100'}, status=status.HTTP_400_BAD_REQUEST)

        service.progress_percentage = progress
        service.save()

        return Response({
            'message': 'Progress updated',
            'progress_percentage': service.progress_percentage
        })


class ServiceAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Service Assignment"""
    queryset = ServiceAssignment.objects.select_related(
        'service', 'employee').all()
    serializer_class = ServiceAssignmentSerializer

    def perform_create(self, serializer):
        assignment = serializer.save()
        # Update employee workload
        employee = assignment.employee
        employee.current_workload = employee.service_assignments.filter(
            service__status__in=['pending', 'in_progress']
        ).count()
        employee.save()


# ============================================
# TIME LOG VIEWS
# ============================================

class TimeLogViewSet(viewsets.ModelViewSet):
    """ViewSet for Time Log management"""
    queryset = TimeLog.objects.select_related('employee', 'service').all()
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['log_date', 'created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return TimeLogCreateSerializer
        return TimeLogSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return TimeLog.objects.none()
        if user.role == 'employee':
            try:
                employee = Employee.objects.get(user=user)
                return TimeLog.objects.filter(employee=employee)
            except Employee.DoesNotExist:
                return TimeLog.objects.none()
        return TimeLog.objects.all()

    def perform_create(self, serializer):
        time_log = serializer.save()
        # Update service actual hours
        service = time_log.service
        total_hours = service.time_logs.aggregate(Sum('hours'))[
            'hours__sum'] or 0
        service.actual_hours = total_hours
        service.save()

    @action(detail=False, methods=['get'])
    def my_logs(self, request):
        """Get current employee's time logs"""
        try:
            employee = Employee.objects.get(user=request.user)
            logs = TimeLog.objects.filter(
                employee=employee).order_by('-log_date')
            serializer = self.get_serializer(logs, many=True)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get time log summary"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        queryset = self.get_queryset()
        if start_date:
            queryset = queryset.filter(log_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(log_date__lte=end_date)

        total_hours = queryset.aggregate(Sum('hours'))['hours__sum'] or 0

        return Response({
            'total_hours': total_hours,
            'total_logs': queryset.count(),
            'date_range': {
                'start': start_date,
                'end': end_date
            }
        })


# ============================================
# PROGRESS UPDATE VIEWS
# ============================================

class ProgressUpdateViewSet(viewsets.ModelViewSet):
    """ViewSet for Progress Updates"""
    queryset = ProgressUpdate.objects.select_related(
        'service', 'employee').all()
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ProgressUpdateCreateSerializer
        return ProgressUpdateSerializer

    def perform_create(self, serializer):
        update = serializer.save()
        # Update service progress
        service = update.service
        service.progress_percentage = update.progress_percentage
        service.save()

        # Create notification for customer
        Notification.objects.create(
            user=service.customer,
            notification_type='service',
            title=f"Progress Update: {service.title}",
            message=f"Your service is now {update.progress_percentage}% complete. {update.update_text}",
            link=f"/services/{service.id}"
        )


# ============================================
# MODIFICATION REQUEST VIEWS
# ============================================

class ModificationRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for Modification Requests"""
    queryset = ModificationRequest.objects.select_related(
        'customer', 'vehicle', 'service').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'modification_type']
    ordering_fields = ['created_at', 'status']

    def get_serializer_class(self):
        if self.action == 'create':
            return ModificationRequestCreateSerializer
        return ModificationRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ModificationRequest.objects.none()
        if user.role == 'customer':
            return ModificationRequest.objects.filter(customer=user)
        return ModificationRequest.objects.all()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve modification request and create service"""
        mod_request = self.get_object()

        if mod_request.status != 'pending':
            return Response({'error': 'Request already processed'}, status=status.HTTP_400_BAD_REQUEST)

        # Create service from modification request
        last_service = Service.objects.order_by('-created_at').first()
        if last_service and last_service.service_number:
            last_number = int(last_service.service_number.split('-')[1])
            new_number = f"SRV-{last_number + 1:05d}"
        else:
            new_number = "SRV-00001"

        service = Service.objects.create(
            service_number=new_number,
            service_type='project',
            vehicle=mod_request.vehicle,
            customer=mod_request.customer,
            title=mod_request.title,
            description=mod_request.description,
            status='pending',
            priority='medium'
        )

        mod_request.status = 'approved'
        mod_request.service = service
        mod_request.save()

        # Create notification
        Notification.objects.create(
            user=mod_request.customer,
            notification_type='service',
            title="Modification Request Approved",
            message=f"Your modification request '{mod_request.title}' has been approved and created as a project.",
            link=f"/services/{service.id}"
        )

        return Response({
            'message': 'Modification request approved',
            'service_id': str(service.id)
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject modification request"""
        mod_request = self.get_object()
        admin_notes = request.data.get('admin_notes', '')

        mod_request.status = 'rejected'
        mod_request.admin_notes = admin_notes
        mod_request.save()

        # Create notification
        Notification.objects.create(
            user=mod_request.customer,
            notification_type='general',
            title="Modification Request Rejected",
            message=f"Your modification request '{mod_request.title}' has been reviewed. {admin_notes}",
            link=f"/modification-requests/{mod_request.id}"
        )

        return Response({'message': 'Modification request rejected'})


# ============================================
# PARTS & INVENTORY VIEWS
# ============================================

class PartViewSet(viewsets.ModelViewSet):
    """ViewSet for Parts management"""
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['part_number', 'name']
    ordering_fields = ['part_number', 'quantity_in_stock']

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get parts that need reordering"""
        low_stock = Part.objects.filter(
            quantity_in_stock__lte=F('reorder_level'))
        serializer = self.get_serializer(low_stock, many=True)
        return Response(serializer.data)


class ServicePartViewSet(viewsets.ModelViewSet):
    """ViewSet for Service Parts"""
    queryset = ServicePart.objects.select_related('service', 'part').all()
    serializer_class = ServicePartSerializer

    def perform_create(self, serializer):
        service_part = serializer.save()
        # Update service actual cost
        service = service_part.service
        total_parts_cost = service.parts_used.aggregate(
            Sum('total_price'))['total_price__sum'] or 0
        service.actual_cost = total_parts_cost
        service.save()


# ============================================
# NOTIFICATION VIEWS
# ============================================

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for Notifications"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Notification.objects.none()
        return Notification.objects.filter(user=user).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        unread = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().update(is_read=True)
        return Response({'message': 'All notifications marked as read'})


# ============================================
# DASHBOARD VIEWS
# ============================================

class CustomerDashboardView(APIView):
    """Customer Dashboard API"""
    permission_classes = [IsCustomer]

    def get(self, request):
        user = request.user

        # Get statistics
        total_vehicles = Vehicle.objects.filter(customer=user).count()
        active_services = Service.objects.filter(
            customer=user,
            status__in=['pending', 'in_progress']
        ).count()
        upcoming_appointments = Appointment.objects.filter(
            customer=user,
            appointment_date__gte=timezone.now(),
            status__in=['pending', 'confirmed']
        ).count()
        pending_modifications = ModificationRequest.objects.filter(
            customer=user,
            status='pending'
        ).count()

        # Get recent services
        recent_services = Service.objects.filter(
            customer=user).order_by('-created_at')[:5]

        # Get notifications
        notifications = Notification.objects.filter(
            user=user, is_read=False).order_by('-created_at')[:10]

        data = {
            'total_vehicles': total_vehicles,
            'active_services': active_services,
            'upcoming_appointments': upcoming_appointments,
            'pending_modifications': pending_modifications,
            'recent_services': recent_services,
            'notifications': notifications
        }

        serializer = CustomerDashboardSerializer(data)
        return Response(serializer.data)


class EmployeeDashboardView(APIView):
    """Employee Dashboard API"""
    permission_classes = [IsEmployee]

    def get(self, request):
        user = request.user

        try:
            employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get statistics
        active_tasks = Service.objects.filter(
            assignments__employee=employee,
            status__in=['pending', 'in_progress']
        ).count()

        # Get total hours logged (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        total_hours = TimeLog.objects.filter(
            employee=employee,
            log_date__gte=thirty_days_ago.date()
        ).aggregate(Sum('hours'))['hours__sum'] or 0

        upcoming_appointments = Appointment.objects.filter(
            assigned_employee=employee,
            appointment_date__gte=timezone.now(),
            status__in=['pending', 'confirmed']
        ).count()

        # Get assigned services
        assigned_services = Service.objects.filter(
            assignments__employee=employee,
            status__in=['pending', 'in_progress']
        ).order_by('-priority', 'created_at')[:10]

        # Get recent time logs
        recent_logs = TimeLog.objects.filter(
            employee=employee).order_by('-log_date')[:10]

        data = {
            'active_tasks': active_tasks,
            'total_hours_logged': total_hours,
            'upcoming_appointments': upcoming_appointments,
            'current_workload': employee.current_workload,
            'assigned_services': assigned_services,
            'recent_time_logs': recent_logs
        }

        serializer = EmployeeDashboardSerializer(data)
        return Response(serializer.data)


class AdminDashboardView(APIView):
    """Admin Dashboard API"""
    permission_classes = [IsAdmin]

    def get(self, request):
        # Get statistics
        total_customers = User.objects.filter(role='customer').count()
        total_employees = Employee.objects.count()
        active_services = Service.objects.filter(
            status__in=['pending', 'in_progress']).count()
        pending_appointments = Appointment.objects.filter(
            status='pending').count()
        pending_modifications = ModificationRequest.objects.filter(
            status='pending').count()

        # Calculate total revenue (completed services)
        total_revenue = Service.objects.filter(status='completed').aggregate(
            Sum('actual_cost')
        )['actual_cost__sum'] or 0

        # Get recent services
        recent_services = Service.objects.order_by('-created_at')[:10]

        # Get employee workloads
        employees = Employee.objects.select_related('user').all()
        employee_workloads = [
            {
                'employee_id': str(emp.id),
                'name': emp.user.get_full_name(),
                'specialization': emp.specialization,
                'current_workload': emp.current_workload,
                'is_available': emp.is_available
            }
            for emp in employees
        ]

        data = {
            'total_customers': total_customers,
            'total_employees': total_employees,
            'active_services': active_services,
            'pending_appointments': pending_appointments,
            'pending_modifications': pending_modifications,
            'total_revenue': total_revenue,
            'recent_services': recent_services,
            'employee_workloads': employee_workloads
        }

        serializer = AdminDashboardSerializer(data)
        return Response(serializer.data)
