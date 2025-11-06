# 🐳 Docker Setup for Billing & Notification Service

This guide will help you run the Django application with MySQL database using Docker.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (comes with Docker Desktop)

## 🚀 Quick Start

### 1️⃣ **Build and Start Containers**

```powershell
# Navigate to the project directory
cd d:\Automobile-Service-Management-System\services\billing-notification-service

# Build and start all containers
docker-compose up --build
```

This will:
- ✅ Create a MySQL 8.0 database container
- ✅ Create a Django application container
- ✅ Run database migrations
- ✅ Create test data automatically
- ✅ Start the Django server on http://localhost:8000

### 2️⃣ **Access the Application**

Once you see `Starting Django server...`, open your browser:

- **Django Admin:** http://localhost:8000/admin/
- **API Root:** http://localhost:8000/api/admin/
- **Customer Dashboard:** http://localhost:8000/api/admin/dashboard/customer/

### 3️⃣ **Test Credentials**

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| john_doe | customer123 | Customer |
| mike_tech | employee123 | Employee |

---

## 🛠️ Useful Commands

### **View Logs**
```powershell
# View all logs
docker-compose logs -f

# View only Django logs
docker-compose logs -f web

# View only MySQL logs
docker-compose logs -f db
```

### **Stop Containers**
```powershell
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps data in volumes)
docker-compose down

# Stop and remove EVERYTHING including database data
docker-compose down -v
```

### **Restart Containers**
```powershell
# Restart all services
docker-compose restart

# Restart only Django
docker-compose restart web
```

### **Access MySQL Database**
```powershell
# Connect to MySQL container
docker exec -it automobile_mysql mysql -u root -p
# Password: root

# Show databases
SHOW DATABASES;

# Use the notification_service database
USE notification_service;

# Show tables
SHOW TABLES;

# View users
SELECT id, username, email, role FROM users;

# Exit MySQL
EXIT;
```

### **Access Django Shell**
```powershell
# Run Django shell inside container
docker exec -it automobile_django python manage.py shell
```

### **Run Django Management Commands**
```powershell
# Create superuser
docker exec -it automobile_django python manage.py createsuperuser

# Run migrations
docker exec -it automobile_django python manage.py migrate

# Create test data (if not auto-created)
docker exec -it automobile_django python create_test_data.py
```

---

## 📊 Container Details

### **MySQL Container**
- **Container Name:** `automobile_mysql`
- **Image:** `mysql:8.0`
- **Port:** `3307:3306` (use localhost:3307 from host machine)
- **Database:** `notification_service`
- **Username:** `root`
- **Password:** `root`
- **Data Volume:** `mysql_data` (persists data)

### **Django Container**
- **Container Name:** `automobile_django`
- **Port:** `8000:8000`
- **Depends on:** MySQL (waits for MySQL to be healthy)

---

## 🔧 Troubleshooting

### **Problem: Containers won't start**
```powershell
# Check container status
docker-compose ps

# View error logs
docker-compose logs
```

### **Problem: Port 8000 already in use**
```powershell
# Stop any local Django server first
# OR change the port in docker-compose.yml:
# ports:
#   - "8001:8000"  # Use 8001 on host
```

### **Problem: Port 3307 already in use**
```powershell
# Change MySQL port in docker-compose.yml:
# ports:
#   - "3308:3306"  # Use 3308 instead
```

### **Problem: Database connection errors**
```powershell
# Rebuild containers
docker-compose down
docker-compose up --build
```

### **Problem: Need to reset database**
```powershell
# Remove all data and start fresh
docker-compose down -v
docker-compose up --build
```

---

## 🎯 Development Workflow

### **Making Code Changes**

The project folder is mounted as a volume, so changes to your code will be reflected immediately:

1. Edit files on your host machine
2. Save changes
3. Django auto-reloader will restart the server
4. Refresh your browser

### **Adding New Dependencies**

1. Add package to `requirements.txt`
2. Rebuild the container:
   ```powershell
   docker-compose down
   docker-compose up --build
   ```

### **Database Migrations**

```powershell
# Create new migrations
docker exec -it automobile_django python manage.py makemigrations

# Apply migrations
docker exec -it automobile_django python manage.py migrate
```

---

## 📝 API Testing with Postman

All endpoints require authentication. Use **Basic Auth** in Postman:

**Example:**
```
GET http://localhost:8000/api/admin/vehicles/

Authorization: Basic Auth
Username: admin
Password: admin123
```

See `ADMIN_SERVICE_README.md` for complete API documentation.

---

## 🔒 Security Notes

**⚠️ For Development Only:**
- The MySQL root password is hardcoded
- Debug mode is enabled
- Secret keys are not randomized

**For Production:**
- Use environment variables for all secrets
- Set `DEBUG = False`
- Use a proper WSGI server (Gunicorn/uWSGI)
- Set up proper database backups
- Use docker secrets for sensitive data

---

## 📚 Files Overview

```
billing-notification-service/
├── Dockerfile              # Django container definition
├── docker-compose.yml      # Multi-container orchestration
├── entrypoint.sh          # Startup script (migrations, test data)
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (gitignored)
├── manage.py             # Django management script
├── create_test_data.py   # Test data generation script
└── admin_service/        # Main Django app
```

---

## ✅ Verification Checklist

After running `docker-compose up --build`, verify:

- [ ] Both containers are running: `docker-compose ps`
- [ ] MySQL is healthy: `docker-compose logs db`
- [ ] Migrations completed: Check logs for "Running migrations"
- [ ] Test data created: Check logs for "Creating test data"
- [ ] Server is running: See "Starting development server"
- [ ] Can access http://localhost:8000/admin/
- [ ] Can login with test credentials
- [ ] Database has data: `docker exec -it automobile_mysql mysql -u root -p`

---

## 🎉 Success!

Your containerized Django application with MySQL is now running! 

**Next Steps:**
1. Test API endpoints in Postman
2. Access Django admin panel
3. View dashboards for different user roles
4. Start developing new features

Need help? Check the logs: `docker-compose logs -f`
