# Quick Start Guide - Admin Service Setup

## Step-by-Step Setup

### 1. Navigate to Project Directory
```powershell
cd d:\Automobile-Service-Management-System\services\billing-notification-service
```

### 2. Activate Python Environment (if using virtual environment)
```powershell
# If you have a virtual environment
.\venv\Scripts\Activate.ps1

# Or create new one
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install/Update Dependencies
```powershell
pip install -r requirements.txt
```

Required packages (already in requirements.txt):
- Django==5.2.7
- djangorestframework==3.16.1
- Pillow==11.0.0
- reportlab==4.4.4
- python-decouple==3.8
- python-dotenv==1.0.1
- mysqlclient (for MySQL) OR psycopg2-binary (for PostgreSQL)

### 4. Configure Database

**Option A: MySQL (Current)**
In `.env` file:
```env
DB_NAME=automobile_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

**Option B: PostgreSQL (Recommended)**
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

### 5. Create Database
```powershell
# For MySQL
mysql -u root -p
CREATE DATABASE automobile_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# For PostgreSQL
psql -U postgres
CREATE DATABASE automobile_db;
\q
```

### 6. Run Migrations
```powershell
# Create migration files
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# You should see output like:
# Running migrations:
#   Applying admin_service.0001_initial... OK
#   Applying notification_service.0001_initial... OK
```

### 7. Create Superuser (Admin Account)
```powershell
python manage.py createsuperuser

# Enter:
# Username: admin
# Email: admin@example.com
# Password: admin123 (or your secure password)
# Password (again): admin123
```

### 8. Create Test Data

Create file: `create_test_data.py` in project root:
```python
import os
import django
from datetime import date, datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'root.settings')
django.setup()

from admin_service.models import User, Employee, Vehicle, Appointment, Service

# Create admin
admin = User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='admin123',
    role='admin',
    first_name='Admin',
    last_name='User'
)
print(f"✅ Created admin: {admin.username}")

# Create customer
customer = User.objects.create_user(
    username='john_doe',
    email='john@example.com',
    password='customer123',
    role='customer',
    first_name='John',
    last_name='Doe',
    phone_number='1234567890',
    address='123 Main St, City, State'
)
print(f"✅ Created customer: {customer.username}")

# Create employee user
emp_user = User.objects.create_user(
    username='jane_tech',
    email='jane@example.com',
    password='employee123',
    role='employee',
    first_name='Jane',
    last_name='Tech',
    phone_number='0987654321'
)

# Create employee profile
employee = Employee.objects.create(
    user=emp_user,
    employee_id='EMP001',
    specialization='Engine Repair',
    hire_date=date.today(),
    is_available=True,
    current_workload=0
)
print(f"✅ Created employee: {employee.employee_id} - {emp_user.get_full_name()}")

# Create vehicle
vehicle = Vehicle.objects.create(
    customer=customer,
    make='Toyota',
    model='Camry',
    year=2020,
    vin='1HGBH41JXMN109186',
    license_plate='ABC123',
    color='Blue',
    mileage=25000
)
print(f"✅ Created vehicle: {vehicle.year} {vehicle.make} {vehicle.model}")

# Create appointment
appointment = Appointment.objects.create(
    customer=customer,
    vehicle=vehicle,
    appointment_date=timezone.now() + timedelta(days=3),
    service_type='Oil Change',
    description='Regular maintenance - oil change and tire rotation',
    status='pending'
)
print(f"✅ Created appointment: {appointment.service_type}")

# Create service
service = Service.objects.create(
    service_number='SRV-00001',
    service_type='maintenance',
    vehicle=vehicle,
    customer=customer,
    title='Regular Maintenance Service',
    description='Oil change, filter replacement, and inspection',
    status='in_progress',
    priority='medium',
    estimated_hours=2.0,
    estimated_cost=150.00,
    progress_percentage=50
)
print(f"✅ Created service: {service.service_number}")

print("\n✅ All test data created successfully!")
print("\n📝 Test User Credentials:")
print("   Admin: admin / admin123")
print("   Customer: john_doe / customer123")
print("   Employee: jane_tech / employee123")
```

Run it:
```powershell
python create_test_data.py
```

### 9. Start Development Server
```powershell
python manage.py runserver 8000
```

### 10. Test the API

**Test URLs:**
- Django Admin: http://localhost:8000/admin/
- Customer Dashboard: http://localhost:8000/api/admin/dashboard/customer/
- Employee Dashboard: http://localhost:8000/api/admin/dashboard/employee/
- Admin Dashboard: http://localhost:8000/api/admin/dashboard/admin/
- API Root: http://localhost:8000/api/admin/
- Notification API: http://localhost:8000/api/notification/

**Login to Django Admin:**
1. Go to: http://localhost:8000/admin/
2. Login with: admin / admin123
3. Browse all models and test data

## Testing API Endpoints

### Using PowerShell + cURL

#### 1. Create User (Public Registration)
```powershell
curl -X POST http://localhost:8000/api/admin/users/ `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"newuser\",\"email\":\"new@example.com\",\"password\":\"pass123\",\"role\":\"customer\",\"first_name\":\"New\",\"last_name\":\"User\"}'
```

#### 2. Get All Users (Admin Only)
```powershell
curl -X GET http://localhost:8000/api/admin/users/ `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3. Get Customer Dashboard
```powershell
curl -X GET http://localhost:8000/api/admin/dashboard/customer/ `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. List Vehicles
```powershell
curl -X GET http://localhost:8000/api/admin/vehicles/
```

#### 5. Create Appointment
```powershell
curl -X POST http://localhost:8000/api/admin/appointments/ `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{\"vehicle\":\"VEHICLE_UUID\",\"appointment_date\":\"2024-02-20T10:00:00Z\",\"service_type\":\"Brake Repair\",\"description\":\"Brake pads replacement\"}'
```

### Using Postman

1. **Download Postman**: https://www.postman.com/downloads/
2. **Create Collection**: "Automobile Admin API"
3. **Set Variables**:
   - `base_url`: http://localhost:8000
   - `token`: YOUR_JWT_TOKEN
4. **Add Requests**:
   - GET {{base_url}}/api/admin/users/
   - GET {{base_url}}/api/admin/dashboard/customer/
   - POST {{base_url}}/api/admin/appointments/
5. **Set Authorization**: Bearer Token → {{token}}

### Using Browser (DRF Browsable API)

1. Start server: `python manage.py runserver`
2. Visit: http://localhost:8000/api/admin/
3. Login with test credentials
4. Browse endpoints interactively
5. Test POST/PUT/DELETE operations

## Verify Setup

### Check Models
```powershell
python manage.py shell
```

```python
from admin_service.models import User, Employee, Vehicle, Service

# Count records
print(f"Users: {User.objects.count()}")
print(f"Employees: {Employee.objects.count()}")
print(f"Vehicles: {Vehicle.objects.count()}")
print(f"Services: {Service.objects.count()}")

# Get specific records
customer = User.objects.get(username='john_doe')
print(f"Customer: {customer.get_full_name()}")

vehicle = Vehicle.objects.first()
print(f"Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}")
```

### Check API Endpoints
```powershell
# List all URLs
python manage.py show_urls
```

## Common Issues & Solutions

### Issue 1: Migration Errors
```
django.db.utils.OperationalError: no such table: admin_service_user
```

**Solution:**
```powershell
python manage.py migrate --run-syncdb
```

### Issue 2: Custom User Model Not Recognized
```
ValueError: Dependency on app with no migrations: admin_service
```

**Solution:**
```powershell
# Delete existing migrations
Remove-Item admin_service\migrations\0*.py
Remove-Item admin_service\migrations\__pycache__ -Recurse

# Recreate migrations
python manage.py makemigrations admin_service
python manage.py migrate
```

### Issue 3: Database Connection Error
```
django.db.utils.OperationalError: (2003, "Can't connect to MySQL server")
```

**Solution:**
- Check MySQL is running: `Get-Service MySQL80`
- Start if stopped: `Start-Service MySQL80`
- Verify credentials in `.env`

### Issue 4: Import Errors
```
ImportError: cannot import name 'User' from 'admin_service.models'
```

**Solution:**
```powershell
# Clear Python cache
Remove-Item -Recurse -Force admin_service\__pycache__
Remove-Item -Recurse -Force notification_service\__pycache__

# Restart server
python manage.py runserver
```

## Next Steps

1. ✅ **Setup Complete** - All models and APIs working
2. 📱 **Test with Frontend** - Connect Next.js app
3. 🔐 **Add Authentication** - Integrate with authentication-service (Java)
4. 📊 **Add Charts** - Dashboard analytics
5. 📧 **Email Integration** - Connect with notification_service
6. 🧪 **Write Tests** - Unit and integration tests
7. 🚀 **Deploy** - Production deployment

## API Documentation

Full API documentation: `ADMIN_SERVICE_README.md`

## Support

If you encounter issues:
1. Check server logs in terminal
2. Check Django admin: http://localhost:8000/admin/
3. Use Django shell for debugging: `python manage.py shell`
4. Check database directly with MySQL Workbench or pgAdmin

---

**Last Updated**: 2024
**Django Version**: 5.2.7
**DRF Version**: 3.16.1
