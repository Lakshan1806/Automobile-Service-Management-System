"""
Test Data Creation Script for Admin Service
Populates database with sample data for testing the admin dashboard

Run: python create_test_data.py
"""

from django.utils import timezone
from admin_service.models import (
    User, Employee, Vehicle, Appointment, Service, ServiceAssignment,
    TimeLog, ProgressUpdate, ModificationRequest, Part, ServicePart, Notification
)
import os
import django
from datetime import date, datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'root.settings')
django.setup()


def create_users():
    """Create test users"""
    print("\n📝 Creating Users...")

    # Admin
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@autoservice.com',
        password='admin123',
        role='admin',
        first_name='System',
        last_name='Administrator',
        phone='1234567890'
    )
    print(f"  ✅ Admin: {admin.username}")

    # Customers
    customers = []
    customer_data = [
        ('john_doe', 'john@example.com', 'John', 'Doe',
         '5551234567', '123 Main St, Springfield'),
        ('jane_smith', 'jane@example.com', 'Jane',
         'Smith', '5559876543', '456 Oak Ave, Riverside'),
        ('bob_wilson', 'bob@example.com', 'Bob',
         'Wilson', '5555551234', '789 Pine Rd, Lakeview'),
    ]

    for username, email, first_name, last_name, phone, address in customer_data:
        customer = User.objects.create_user(
            username=username,
            email=email,
            password='customer123',
            role='customer',
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            address=address
        )
        customers.append(customer)
        print(f"  ✅ Customer: {customer.username}")

    # Employee users
    employee_users = []
    employee_data = [
        ('mike_tech', 'mike@autoservice.com', 'Mike', 'Johnson', '5552221111'),
        ('sarah_mech', 'sarah@autoservice.com', 'Sarah', 'Davis', '5553332222'),
        ('david_eng', 'david@autoservice.com', 'David', 'Martinez', '5554443333'),
    ]

    for username, email, first_name, last_name, phone in employee_data:
        emp_user = User.objects.create_user(
            username=username,
            email=email,
            password='employee123',
            role='employee',
            first_name=first_name,
            last_name=last_name,
            phone=phone
        )
        employee_users.append(emp_user)
        print(f"  ✅ Employee User: {emp_user.username}")

    return admin, customers, employee_users


def create_employees(employee_users):
    """Create employee profiles"""
    print("\n👷 Creating Employee Profiles...")

    employees = []
    specializations = ['Engine Repair',
                       'Transmission Specialist', 'Electrical Systems']

    for i, emp_user in enumerate(employee_users):
        employee = Employee.objects.create(
            user=emp_user,
            employee_id=f'EMP{i+1:03d}',
            specialization=specializations[i],
            hire_date=date.today() - timedelta(days=365*(i+1)),
            is_available=True,
            current_workload=0
        )
        employees.append(employee)
        print(
            f"  ✅ {employee.employee_id}: {emp_user.get_full_name()} - {employee.specialization}")

    return employees


def create_vehicles(customers):
    """Create customer vehicles"""
    print("\n🚗 Creating Vehicles...")

    vehicles = []
    vehicle_data = [
        ('Toyota', 'Camry', 2020, '1HGBH41JXMN109186', 'ABC123', 'Blue', 25000),
        ('Honda', 'Accord', 2019, '2HGFC1F59KH542301', 'XYZ789', 'Silver', 32000),
        ('Ford', 'F-150', 2021, '1FTFW1E85KFA12345', 'DEF456', 'Black', 18000),
        ('Tesla', 'Model 3', 2022, '5YJ3E1EA4KF123456', 'TES001', 'White', 12000),
        ('Chevrolet', 'Silverado', 2018, '1GCVKREC5FZ123456', 'CHV999', 'Red', 45000),
    ]

    for i, (make, model, year, vin, plate, color, mileage) in enumerate(vehicle_data):
        customer = customers[i % len(customers)]
        vehicle = Vehicle.objects.create(
            customer=customer,
            make=make,
            model=model,
            year=year,
            vin=vin,
            license_plate=plate,
            color=color,
            mileage=mileage
        )
        vehicles.append(vehicle)
        print(
            f"  ✅ {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.license_plate})")

    return vehicles


def create_appointments(customers, vehicles, employees):
    """Create appointments"""
    print("\n📅 Creating Appointments...")

    appointments = []
    appointment_data = [
        (3, 'Oil Change', 'Regular maintenance - oil change and tire rotation', 'confirmed'),
        (5, 'Brake Inspection', 'Customer reported squeaking noise', 'pending'),
        (7, 'Engine Diagnostics', 'Check engine light is on', 'confirmed'),
        (-2, 'Tire Replacement', 'Replace all four tires', 'completed'),
    ]

    for i, (days_offset, service_type, description, status) in enumerate(appointment_data):
        customer = customers[i % len(customers)]
        vehicle = vehicles[i % len(vehicles)]
        employee = employees[i %
                             len(employees)] if status != 'pending' else None

        appointment = Appointment.objects.create(
            customer=customer,
            vehicle=vehicle,
            appointment_date=timezone.now() + timedelta(days=days_offset),
            service_type=service_type,
            description=description,
            status=status,
            assigned_employee=employee,
            estimated_duration=timedelta(hours=2),  # 2 hours estimated
            estimated_cost=Decimal('100.00')
        )
        appointments.append(appointment)
        print(f"  ✅ {appointment.service_type} - {appointment.status}")

    return appointments


def create_services(customers, vehicles, employees):
    """Create services"""
    print("\n🔧 Creating Services...")

    services = []
    service_data = [
        ('maintenance', 'Regular Maintenance Service', 'Oil change, filter replacement, and inspection',
         'completed', 'medium', 2.0, 150.00, 2.5, 165.00, 100),
        ('repair', 'Brake System Repair', 'Replace brake pads and rotors',
         'in_progress', 'high', 4.0, 450.00, 3.0, 0, 75),
        ('diagnostic', 'Engine Diagnostics', 'Diagnose check engine light',
         'pending', 'high', 1.5, 120.00, 0, 0, 0),
        ('project', 'Custom Exhaust System', 'Install performance exhaust system',
         'in_progress', 'low', 8.0, 1200.00, 6.0, 950.00, 50),
    ]

    for i, (service_type, title, description, status, priority, est_hours, est_cost,
            act_hours, act_cost, progress) in enumerate(service_data):

        customer = customers[i % len(customers)]
        vehicle = vehicles[i % len(vehicles)]

        service = Service.objects.create(
            service_number=f'SRV-{i+1:05d}',
            service_type=service_type,
            vehicle=vehicle,
            customer=customer,
            title=title,
            description=description,
            status=status,
            priority=priority,
            estimated_hours=Decimal(str(est_hours)),
            estimated_cost=Decimal(str(est_cost)),
            actual_hours=Decimal(str(act_hours)),
            actual_cost=Decimal(str(act_cost)),
            progress_percentage=progress,
            start_date=timezone.now() - timedelta(days=5) if status != 'pending' else None,
            end_date=timezone.now() - timedelta(days=1) if status == 'completed' else None
        )
        services.append(service)
        print(f"  ✅ {service.service_number}: {service.title} - {service.status}")

    return services


def create_service_assignments(services, employees):
    """Assign employees to services"""
    print("\n👥 Creating Service Assignments...")

    assignments = []
    for i, service in enumerate(services):
        if service.status != 'pending':
            employee = employees[i % len(employees)]
            assignment = ServiceAssignment.objects.create(
                service=service,
                employee=employee,
                is_lead=True  # Make them the lead
            )
            assignments.append(assignment)

            # Update employee workload
            employee.current_workload = employee.service_assignments.filter(
                service__status__in=['pending', 'in_progress']
            ).count()
            employee.save()

            print(
                f"  ✅ {service.service_number} → {employee.user.get_full_name()}")

    return assignments


def create_time_logs(services, employees):
    """Create time logs"""
    print("\n⏱️ Creating Time Logs...")

    time_logs = []
    for i, service in enumerate(services):
        if service.status in ['in_progress', 'completed']:
            employee = employees[i % len(employees)]

            # Create multiple time logs for each service
            log_data = [
                (4, 2.0, 'Initial diagnostic and assessment'),
                (3, 1.5, 'Ordered and received parts'),
                (2, 3.0, 'Performed repair work'),
                (1, 1.0, 'Final testing and quality check'),
            ]

            for days_ago, hours, task in log_data[:2 if service.status == 'in_progress' else 4]:
                time_log = TimeLog.objects.create(
                    employee=employee,
                    service=service,
                    log_date=(timezone.now() -
                              timedelta(days=days_ago)).date(),
                    hours=Decimal(str(hours)),
                    description=task  # Changed from task_description
                )
                time_logs.append(time_log)

    print(f"  ✅ Created {len(time_logs)} time logs")
    return time_logs


def create_progress_updates(services, employees):
    """Create progress updates"""
    print("\n📈 Creating Progress Updates...")

    updates = []
    for i, service in enumerate(services):
        if service.status in ['in_progress', 'completed']:
            employee = employees[i % len(employees)]

            update_data = [
                (25, 'Service started, initial inspection completed'),
                (50, 'Parts ordered and repair work in progress'),
                (75, 'Repair completed, running tests'),
                (100, 'Service completed successfully'),
            ]

            for progress, text in update_data[:2 if service.status == 'in_progress' else 4]:
                if progress <= service.progress_percentage:
                    update = ProgressUpdate.objects.create(
                        service=service,
                        employee=employee,
                        progress_percentage=progress,
                        update_text=text,
                        images=[]
                    )
                    updates.append(update)

    print(f"  ✅ Created {len(updates)} progress updates")
    return updates


def create_modification_requests(customers, vehicles):
    """Create modification requests"""
    print("\n🔨 Creating Modification Requests...")

    requests = []
    mod_data = [
        ('Custom Paint Job', 'paint',
         'Matte black wrap with red accents', '$2000-$3000', 'pending'),
        ('Performance Upgrade', 'performance',
         'Turbocharger installation and ECU tuning', '$5000-$8000', 'approved'),
        ('Interior Customization', 'interior',
         'Leather seats and custom dashboard', '$3000-$4000', 'pending'),
    ]

    for i, (title, mod_type, description, budget, status) in enumerate(mod_data):
        customer = customers[i % len(customers)]
        vehicle = vehicles[i % len(vehicles)]

        request = ModificationRequest.objects.create(
            customer=customer,
            vehicle=vehicle,
            title=title,
            modification_type=mod_type,
            description=description,
            budget_range=budget,
            status=status,
            admin_notes='Approved for scheduling' if status == 'approved' else ''
        )
        requests.append(request)
        print(f"  ✅ {request.title} - {request.status}")

    return requests


def create_parts():
    """Create inventory parts"""
    print("\n🔩 Creating Parts...")

    parts = []
    parts_data = [
        ('BRK-001', 'Brake Pad Set',
         'Ceramic brake pads for front wheels', 50, 10, 45.00),
        ('OIL-001', 'Motor Oil 5W-30',
         'Synthetic motor oil, 5 quart container', 100, 20, 25.00),
        ('FLT-001', 'Oil Filter', 'Premium oil filter', 75, 15, 8.00),
        ('TIR-001', 'All-Season Tire', '225/60R17 all-season tire', 40, 8, 120.00),
        ('SPK-001', 'Spark Plug Set', 'Iridium spark plugs, set of 4', 60, 12, 32.00),
    ]

    for part_num, name, description, qty, reorder, price in parts_data:
        part = Part.objects.create(
            part_number=part_num,
            name=name,
            description=description,
            quantity_in_stock=qty,
            reorder_level=reorder,
            unit_price=Decimal(str(price))
        )
        parts.append(part)
        print(
            f"  ✅ {part.part_number}: {part.name} (Stock: {part.quantity_in_stock})")

    return parts


def create_service_parts(services, parts):
    """Link parts to services"""
    print("\n🔗 Creating Service-Parts Links...")

    service_parts = []

    # Service 1 (Maintenance) - Oil change
    if len(services) > 0:
        sp1 = ServicePart.objects.create(
            service=services[0],
            part=parts[1],  # Motor Oil
            quantity=1,
            unit_price=parts[1].unit_price
        )
        sp2 = ServicePart.objects.create(
            service=services[0],
            part=parts[2],  # Oil Filter
            quantity=1,
            unit_price=parts[2].unit_price
        )
        service_parts.extend([sp1, sp2])

    # Service 2 (Brake Repair)
    if len(services) > 1:
        sp3 = ServicePart.objects.create(
            service=services[1],
            part=parts[0],  # Brake Pads
            quantity=2,
            unit_price=parts[0].unit_price
        )
        service_parts.append(sp3)

    print(f"  ✅ Linked {len(service_parts)} parts to services")
    return service_parts


def create_notifications(users):
    """Create notifications"""
    print("\n🔔 Creating Notifications...")

    notifications = []
    notification_data = [
        ('service', 'Service Update',
         'Your vehicle maintenance is 75% complete', '/services/1'),
        ('appointment', 'Appointment Reminder',
         'Your appointment is tomorrow at 10:00 AM', '/appointments/1'),
        ('general', 'Welcome!', 'Thank you for choosing our service center', '/dashboard'),
    ]

    for user in users:
        for notif_type, title, message, link in notification_data:
            notification = Notification.objects.create(
                user=user,
                notification_type=notif_type,
                title=title,
                message=message,
                link=link,
                is_read=False
            )
            notifications.append(notification)

    print(f"  ✅ Created {len(notifications)} notifications")
    return notifications


def main():
    """Main execution"""
    print("\n" + "="*60)
    print("  AUTO SERVICE MANAGEMENT - TEST DATA CREATION")
    print("="*60)

    try:
        # Create data
        admin, customers, employee_users = create_users()
        employees = create_employees(employee_users)
        vehicles = create_vehicles(customers)
        appointments = create_appointments(customers, vehicles, employees)
        services = create_services(customers, vehicles, employees)
        assignments = create_service_assignments(services, employees)
        time_logs = create_time_logs(services, employees)
        progress_updates = create_progress_updates(services, employees)
        mod_requests = create_modification_requests(customers, vehicles)
        parts = create_parts()
        service_parts = create_service_parts(services, parts)
        all_users = [admin] + customers + employee_users
        notifications = create_notifications(
            all_users[:3])  # Only for first 3 users

        # Summary
        print("\n" + "="*60)
        print("  ✅ TEST DATA CREATION COMPLETED!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"   👥 Users: {User.objects.count()}")
        print(f"   👷 Employees: {Employee.objects.count()}")
        print(f"   🚗 Vehicles: {Vehicle.objects.count()}")
        print(f"   📅 Appointments: {Appointment.objects.count()}")
        print(f"   🔧 Services: {Service.objects.count()}")
        print(f"   👥 Assignments: {ServiceAssignment.objects.count()}")
        print(f"   ⏱️  Time Logs: {TimeLog.objects.count()}")
        print(f"   📈 Progress Updates: {ProgressUpdate.objects.count()}")
        print(
            f"   🔨 Modification Requests: {ModificationRequest.objects.count()}")
        print(f"   🔩 Parts: {Part.objects.count()}")
        print(f"   🔗 Service Parts: {ServicePart.objects.count()}")
        print(f"   🔔 Notifications: {Notification.objects.count()}")

        print(f"\n🔑 Test Credentials:")
        print(f"   Admin:    admin / admin123")
        print(f"   Customer: john_doe / customer123")
        print(f"   Employee: mike_tech / employee123")

        print(f"\n🌐 Access Points:")
        print(f"   Django Admin: http://localhost:8000/admin/")
        print(f"   API Root: http://localhost:8000/api/admin/")
        print(f"   Customer Dashboard: http://localhost:8000/api/admin/dashboard/customer/")
        print(f"   Employee Dashboard: http://localhost:8000/api/admin/dashboard/employee/")
        print(f"   Admin Dashboard: http://localhost:8000/api/admin/dashboard/admin/")

        print("\n✅ You can now test the application!")
        print("="*60 + "\n")

    except Exception as e:
        print(f"\n❌ Error creating test data: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
