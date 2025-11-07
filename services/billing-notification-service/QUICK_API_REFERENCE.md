# ✅ API Endpoints - Quick Reference

## 🔗 Correct URLs (Fixed!)

### ❌ WRONG (Before Fix)
```
http://127.0.0.1:8000/api/otp/generate/          ❌ 404 Error
http://127.0.0.1:8000/api/bill/generate/         ❌ 404 Error
```

### ✅ CORRECT (After Fix)
```
http://127.0.0.1:8000/api/notification/otp/generate/     ✅ Works!
http://127.0.0.1:8000/api/notification/bill/generate/    ✅ Works!
```

---

## 📋 All Working Endpoints

### 🔐 Notification Service (OTP & Billing)
Base: `/api/notification/`

**OTP:**
- POST `/api/notification/otp/generate/` - Generate OTP
- POST `/api/notification/otp/send-email/` - Send OTP via email
- POST `/api/notification/otp/verify/` - Verify OTP

**Billing:**
- POST `/api/notification/bill/generate/` - Generate bill
- POST `/api/notification/bill/send/` - Send bill via email
- GET `/api/notification/bill/{bill_id}/` - Get bill details
- POST `/api/notification/bill/{bill_id}/send/` - Get & send bill
- POST `/api/notification/bill/{bill_id}/notify/` - Send notification

---

### 👥 Admin Service (Dashboard & Management)
Base: `/api/admin/`

**Dashboards:**
- GET `/api/admin/dashboard/customer/` - Customer dashboard
- GET `/api/admin/dashboard/employee/` - Employee dashboard
- GET `/api/admin/dashboard/admin/` - Admin dashboard

**Resources (Full CRUD):**
- `/api/admin/users/`
- `/api/admin/employees/`
- `/api/admin/vehicles/`
- `/api/admin/appointments/`
- `/api/admin/services/`
- `/api/admin/service-assignments/`
- `/api/admin/time-logs/`
- `/api/admin/progress-updates/`
- `/api/admin/modification-requests/`
- `/api/admin/parts/`
- `/api/admin/service-parts/`
- `/api/admin/notifications/`

**Special Actions:**
- POST `/api/admin/services/{id}/update_progress/` - Update service progress (Employee)
- POST `/api/admin/services/{id}/update_status/` - Update service status (Employee)

---

## 🔑 Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Customer | john_doe | customer123 |
| Employee | mike_tech | employee123 |

---

## 🧪 Quick Postman Tests

### 1. Generate OTP (No Auth Required)
```http
POST http://localhost:8000/api/notification/otp/generate/
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### 2. Admin Dashboard (Requires Admin Auth)
```http
GET http://localhost:8000/api/admin/dashboard/admin/
Authorization: Basic admin:admin123
```

### 3. List Services (Requires Auth)
```http
GET http://localhost:8000/api/admin/services/
Authorization: Basic admin:admin123
```

### 4. Update Service Progress (Employee Only)
```http
POST http://localhost:8000/api/admin/services/{service_id}/update_progress/
Authorization: Basic mike_tech:employee123
Content-Type: application/json

{
  "progress_percentage": 75,
  "notes": "Almost complete"
}
```

---

## ⚠️ Important Notes

1. **Always use trailing slash** on URLs: `/api/admin/services/` ✅ not `/api/admin/services` ❌
2. **Use Basic Authentication** for all admin endpoints
3. **OTP endpoints** don't require authentication
4. **Employee permissions** - Only assigned employees can update service progress/status
5. **Docker is running** - Access at `http://localhost:8000`

---

## 🐳 Docker Commands

```powershell
# Check status
docker-compose ps

# View logs
docker-compose logs -f web

# Restart services
docker-compose restart

# Stop all
docker-compose down

# Start all
docker-compose up -d
```

---

## 📊 Test Data Available

- ✅ 7 Users (admin, customers, employees)
- ✅ 3 Employees with specializations
- ✅ 5 Vehicles
- ✅ 4 Appointments
- ✅ 4 Services (various statuses)
- ✅ Service assignments
- ✅ Time logs
- ✅ Progress updates
- ✅ Notifications

Everything is ready for testing! 🚀
