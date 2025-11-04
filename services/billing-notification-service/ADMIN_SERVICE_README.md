# Admin Service - Dashboard Backend API

## Overview
The Admin Service provides a comprehensive dashboard backend for the Automobile Service Management System. It supports three user types with distinct capabilities:
- **Customers**: View service progress, book appointments, request modifications
- **Employees**: Log time, track progress, view assignments
- **Admins**: Complete oversight of users, employees, services, and operations

## Architecture

### Technology Stack
- **Framework**: Django 5.2.7 + Django REST Framework 3.16.1
- **Database**: PostgreSQL/MySQL with Django ORM
- **Authentication**: Custom User model with role-based access
- **Primary Keys**: UUID for all models

### Database Models (14 Total)

1. **User** (extends AbstractUser)
   - Custom authentication with role field (customer/employee/admin)
   - Fields: username, email, password, role, phone_number, address

2. **Employee**
   - Employee profiles linked to User
   - Fields: employee_id, specialization, hire_date, is_available, current_workload

3. **Vehicle**
   - Customer vehicles
   - Fields: make, model, year, vin, license_plate, color, mileage

4. **Appointment**
   - Service appointments
   - Fields: appointment_date, service_type, status, description, assigned_employee

5. **Service**
   - Main service/project tracking
   - Fields: service_number (auto-generated), type, status, priority, progress_percentage, hours, costs

6. **ServiceAssignment**
   - Many-to-many relationship between services and employees
   - Fields: service, employee, role, assigned_date

7. **TimeLog**
   - Employee time tracking
   - Fields: employee, service, log_date, hours, task_description

8. **ProgressUpdate**
   - Service progress updates with images
   - Fields: service, employee, progress_percentage, update_text, images (JSONField)

9. **ModificationRequest**
   - Customer modification/customization requests
   - Fields: title, modification_type, description, budget_range, images, status

10. **Part**
    - Inventory management
    - Fields: part_number, name, description, quantity_in_stock, reorder_level, unit_price

11. **ServicePart**
    - Parts used in services
    - Fields: service, part, quantity_used, unit_price_at_time, total_price

12. **Notification**
    - User notifications
    - Fields: user, type, title, message, link, is_read

## API Endpoints

### Base URL
```
http://localhost:8000/api/admin/
```

### Dashboard Endpoints

#### Customer Dashboard
```http
GET /api/admin/dashboard/customer/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_vehicles": 2,
  "active_services": 1,
  "upcoming_appointments": 2,
  "pending_modifications": 1,
  "recent_services": [...],
  "notifications": [...]
}
```

#### Employee Dashboard
```http
GET /api/admin/dashboard/employee/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "active_tasks": 5,
  "total_hours_logged": 120.5,
  "upcoming_appointments": 3,
  "current_workload": 5,
  "assigned_services": [...],
  "recent_time_logs": [...]
}
```

#### Admin Dashboard
```http
GET /api/admin/dashboard/admin/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_customers": 150,
  "total_employees": 25,
  "active_services": 45,
  "pending_appointments": 12,
  "pending_modifications": 8,
  "total_revenue": 125000.00,
  "recent_services": [...],
  "employee_workloads": [...]
}
```

### Resource Endpoints (CRUD)

#### Users
```http
GET    /api/admin/users/                    # List all users
POST   /api/admin/users/                    # Create user (AllowAny)
GET    /api/admin/users/{id}/               # Get user details
PUT    /api/admin/users/{id}/               # Update user
DELETE /api/admin/users/{id}/               # Delete user
GET    /api/admin/users/me/                 # Get current user profile
GET    /api/admin/users/customers/          # Get all customers
GET    /api/admin/users/employees_list/     # Get all employees
```

#### Employees
```http
GET    /api/admin/employees/                # List all employees
POST   /api/admin/employees/                # Create employee
GET    /api/admin/employees/{id}/           # Get employee details
PUT    /api/admin/employees/{id}/           # Update employee
DELETE /api/admin/employees/{id}/           # Delete employee
GET    /api/admin/employees/{id}/workload/  # Get employee workload
```

#### Vehicles
```http
GET    /api/admin/vehicles/                       # List vehicles
POST   /api/admin/vehicles/                       # Create vehicle
GET    /api/admin/vehicles/{id}/                  # Get vehicle details
PUT    /api/admin/vehicles/{id}/                  # Update vehicle
DELETE /api/admin/vehicles/{id}/                  # Delete vehicle
GET    /api/admin/vehicles/{id}/service_history/  # Get service history
```

#### Appointments
```http
GET    /api/admin/appointments/              # List appointments
POST   /api/admin/appointments/              # Create appointment
GET    /api/admin/appointments/{id}/         # Get appointment details
PUT    /api/admin/appointments/{id}/         # Update appointment
DELETE /api/admin/appointments/{id}/         # Delete appointment
GET    /api/admin/appointments/upcoming/     # Get upcoming appointments
POST   /api/admin/appointments/{id}/confirm/ # Confirm appointment
POST   /api/admin/appointments/{id}/cancel/  # Cancel appointment
```

#### Services
```http
GET    /api/admin/services/                       # List services
POST   /api/admin/services/                       # Create service
GET    /api/admin/services/{id}/                  # Get service details
PUT    /api/admin/services/{id}/                  # Update service
DELETE /api/admin/services/{id}/                  # Delete service
GET    /api/admin/services/active/                # Get active services
POST   /api/admin/services/{id}/update_status/    # Update service status
POST   /api/admin/services/{id}/update_progress/  # Update progress percentage
```

#### Time Logs
```http
GET    /api/admin/time-logs/           # List time logs
POST   /api/admin/time-logs/           # Create time log
GET    /api/admin/time-logs/{id}/      # Get time log details
PUT    /api/admin/time-logs/{id}/      # Update time log
DELETE /api/admin/time-logs/{id}/      # Delete time log
GET    /api/admin/time-logs/my_logs/   # Get current employee's logs
GET    /api/admin/time-logs/summary/   # Get time log summary
```

#### Progress Updates
```http
GET    /api/admin/progress-updates/     # List progress updates
POST   /api/admin/progress-updates/     # Create progress update
GET    /api/admin/progress-updates/{id}/ # Get update details
PUT    /api/admin/progress-updates/{id}/ # Update progress update
DELETE /api/admin/progress-updates/{id}/ # Delete progress update
```

#### Modification Requests
```http
GET    /api/admin/modification-requests/              # List requests
POST   /api/admin/modification-requests/              # Create request
GET    /api/admin/modification-requests/{id}/         # Get request details
PUT    /api/admin/modification-requests/{id}/         # Update request
DELETE /api/admin/modification-requests/{id}/         # Delete request
POST   /api/admin/modification-requests/{id}/approve/ # Approve & create service
POST   /api/admin/modification-requests/{id}/reject/  # Reject request
```

#### Parts
```http
GET    /api/admin/parts/            # List parts
POST   /api/admin/parts/            # Create part
GET    /api/admin/parts/{id}/       # Get part details
PUT    /api/admin/parts/{id}/       # Update part
DELETE /api/admin/parts/{id}/       # Delete part
GET    /api/admin/parts/low_stock/  # Get parts needing reorder
```

#### Notifications
```http
GET    /api/admin/notifications/                   # List user's notifications
GET    /api/admin/notifications/unread/            # Get unread notifications
POST   /api/admin/notifications/{id}/mark_read/    # Mark as read
POST   /api/admin/notifications/mark_all_read/     # Mark all as read
```

## Permissions

### Custom Permission Classes
- **IsCustomer**: Allows only users with role='customer'
- **IsEmployee**: Allows only users with role='employee'
- **IsAdmin**: Allows only users with role='admin'

### Permission Rules
- **Dashboard endpoints**: Role-specific (customer/employee/admin)
- **User creation**: AllowAny (public registration)
- **All other endpoints**: Admin only (default)
- **Personal data**: Users can only access their own data

## Setup Instructions

### 1. Install Dependencies
```bash
cd services/billing-notification-service
pip install -r requirements.txt
```

### 2. Configure Database
Update `root/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'automobile_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 3. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser
```bash
python manage.py createsuperuser
# Enter: username, email, password
```

### 5. Create Test Data
Create a file `create_test_data.py`:
```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'root.settings')
django.setup()

from admin_service.models import User, Employee, Vehicle
from datetime import date

# Create admin user
admin = User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='admin123',
    role='admin'
)

# Create customer
customer = User.objects.create_user(
    username='john_doe',
    email='john@example.com',
    password='customer123',
    role='customer',
    first_name='John',
    last_name='Doe',
    phone_number='1234567890'
)

# Create employee
emp_user = User.objects.create_user(
    username='jane_tech',
    email='jane@example.com',
    password='employee123',
    role='employee',
    first_name='Jane',
    last_name='Tech'
)

employee = Employee.objects.create(
    user=emp_user,
    employee_id='EMP001',
    specialization='Engine Repair',
    hire_date=date.today()
)

# Create vehicle
vehicle = Vehicle.objects.create(
    customer=customer,
    make='Toyota',
    model='Camry',
    year=2020,
    vin='1234567890ABCDEFG',
    license_plate='ABC123',
    color='Blue',
    mileage=25000
)

print("Test data created successfully!")
```

Run:
```bash
python create_test_data.py
```

### 6. Start Development Server
```bash
python manage.py runserver 8000
```

## Testing the API

### Using cURL

#### 1. Create User (Registration)
```bash
curl -X POST http://localhost:8000/api/admin/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "role": "customer",
    "first_name": "Test",
    "last_name": "User"
  }'
```

#### 2. Get Customer Dashboard
```bash
curl -X GET http://localhost:8000/api/admin/dashboard/customer/ \
  -H "Authorization: Bearer <your-token>"
```

#### 3. Create Vehicle
```bash
curl -X POST http://localhost:8000/api/admin/vehicles/ \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Honda",
    "model": "Accord",
    "year": 2021,
    "vin": "9876543210ZYXWVUT",
    "license_plate": "XYZ789",
    "color": "Red",
    "mileage": 15000
  }'
```

#### 4. Book Appointment
```bash
curl -X POST http://localhost:8000/api/admin/appointments/ \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle": "<vehicle-uuid>",
    "appointment_date": "2024-02-15T10:00:00Z",
    "service_type": "Oil Change",
    "description": "Regular maintenance"
  }'
```

#### 5. Log Employee Time
```bash
curl -X POST http://localhost:8000/api/admin/time-logs/ \
  -H "Authorization: Bearer <employee-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "<service-uuid>",
    "log_date": "2024-02-10",
    "hours": 4.5,
    "task_description": "Engine diagnostics and repair"
  }'
```

### Using Postman

1. **Import Collection**: Create a Postman collection
2. **Set Base URL**: `http://localhost:8000/api/admin/`
3. **Add Authorization**: Bearer Token in Headers
4. **Test Endpoints**: Use the endpoint list above

## Features

### Automatic Calculations
- **Service Number**: Auto-generated (SRV-00001, SRV-00002, etc.)
- **Total Hours**: Auto-calculated from time logs
- **Total Cost**: Auto-calculated from parts used
- **Employee Workload**: Auto-updated on assignment changes

### Notifications
- Automatic notifications created on:
  - Progress updates
  - Modification request approval/rejection
  - Service status changes

### Search & Filtering
- **Search**: All list endpoints support search
- **Ordering**: Sort by created_at, status, priority, etc.
- **Filtering**: Filter by status, date ranges, user roles

## Business Logic

### Service Workflow
1. **Customer books appointment** → Status: `pending`
2. **Admin confirms appointment** → Status: `confirmed`
3. **Service created** → Status: `pending`, auto-generate service number
4. **Employee assigned** → Update employee workload
5. **Service starts** → Status: `in_progress`, set start_date
6. **Employee logs time** → Update service actual_hours
7. **Progress updates posted** → Update progress_percentage, notify customer
8. **Service completes** → Status: `completed`, set end_date, progress=100%

### Modification Request Workflow
1. **Customer submits request** → Status: `pending`
2. **Admin reviews** → Approve or Reject
3. **If approved** → Create Service, link to request, notify customer
4. **If rejected** → Update status, add admin notes, notify customer

## Integration with Other Services

### Authentication Service
- User authentication handled by authentication-service (Java)
- Admin service validates JWT tokens
- User roles synchronized

### Appointment Service
- Appointment data synced with appointment-service (Java)
- Real-time availability updates

### Customer Service
- Customer data synced with customer-service (C#/.NET)
- Vehicle registration updates

## Security

### Authentication
- JWT Bearer token required for all endpoints (except user creation)
- Token validated on each request

### Authorization
- Role-based access control (RBAC)
- Customers: Can only view/modify their own data
- Employees: Can only view assigned tasks and log time
- Admins: Full access to all data

### Data Validation
- All inputs validated by DRF serializers
- Min/max validators on numeric fields
- Choice fields for status/type fields
- UUID validation on relationships

## Performance Optimization

### Database Queries
- `select_related()`: For foreign key relationships
- `prefetch_related()`: For many-to-many relationships
- Indexed fields: service_number, employee_id, vin, license_plate

### Caching
- Consider adding Redis for:
  - Dashboard statistics
  - Frequently accessed data
  - Session management

## Error Handling

### HTTP Status Codes
- **200 OK**: Successful GET/PUT
- **201 Created**: Successful POST
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Missing/invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors

### Example Error Response
```json
{
  "error": "Invalid status",
  "details": "Status must be one of: pending, confirmed, in_progress, completed, cancelled"
}
```

## Troubleshooting

### Migration Errors
```bash
# Reset migrations (development only!)
python manage.py migrate admin_service zero
python manage.py showmigrations
python manage.py makemigrations
python manage.py migrate
```

### Permission Denied
- Check user role matches endpoint requirement
- Verify JWT token is valid
- Check `is_active` field on User

### 404 Not Found
- Verify URL pattern matches exactly
- Check if resource UUID is correct
- Ensure model exists in database

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live notifications
2. **File Upload**: Direct image upload for progress updates
3. **Reporting**: PDF reports for services and invoices
4. **Analytics**: Charts and graphs for dashboard
5. **Email Notifications**: Integration with notification_service
6. **Mobile API**: Optimized endpoints for mobile apps
7. **Caching**: Redis integration for performance
8. **Testing**: Unit tests and integration tests

## API Documentation

### Browsable API
Visit: `http://localhost:8000/api/admin/` in browser when authenticated

### OpenAPI/Swagger
Install `drf-spectacular`:
```bash
pip install drf-spectacular
```

Add to `settings.py`:
```python
INSTALLED_APPS += ['drf_spectacular']

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}
```

Generate schema:
```bash
python manage.py spectacular --file schema.yml
```

## Support

For issues or questions:
- Check logs: `python manage.py runserver` output
- Django admin: `http://localhost:8000/admin/`
- Database queries: Use Django shell `python manage.py shell`

## License

Proprietary - Automobile Service Management System
