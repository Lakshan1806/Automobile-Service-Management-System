# 🚀 Complete API Endpoints Guide

## Base URL
```
http://localhost:8000
```

## 🔑 Authentication
All endpoints require **Basic Authentication** except where noted.

### Test Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Customer | john_doe | customer123 |
| Employee | mike_tech | employee123 |

---

## 📧 NOTIFICATION SERVICE APIs

### OTP Endpoints

#### 1. Generate OTP
**POST** `/api/notification/otp/generate/`
```json
// Request Body
{
  "email": "user@example.com"
}

// Response (200 OK)
{
  "success": true,
  "message": "OTP generated successfully",
  "otp": "123456"  // Only in debug mode
}
```

#### 2. Send OTP Email
**POST** `/api/notification/otp/send-email/`
```json
// Request Body
{
  "email": "user@example.com"
}

// Response (200 OK)
{
  "success": true,
  "message": "OTP sent successfully"
}
```

#### 3. Verify OTP
**POST** `/api/notification/otp/verify/`
```json
// Request Body
{
  "email": "user@example.com",
  "otp_code": "123456"
}

// Response (200 OK)
{
  "success": true,
  "message": "OTP verified successfully"
}
```

---

### Billing Endpoints

#### 4. Generate Bill
**POST** `/api/notification/bill/generate/`
```json
// Request Body
{
  "service_id": "service-uuid-here",
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "items": [
    {
      "description": "Oil Change",
      "quantity": 1,
      "unit_price": 50.00
    }
  ],
  "tax_rate": 0.08
}

// Response (201 Created)
{
  "bill_id": "BILL-001",
  "total_amount": 54.00,
  "pdf_path": "/path/to/bill.pdf"
}
```

#### 5. Send Bill Email
**POST** `/api/notification/bill/send/`
```json
// Request Body
{
  "bill_id": "BILL-001",
  "recipient_email": "customer@example.com"
}

// Response (200 OK)
{
  "success": true,
  "message": "Bill sent successfully"
}
```

#### 6. Get Bill
**GET** `/api/notification/bill/{bill_id}/`

Response: Returns bill details

#### 7. Get and Send Bill
**POST** `/api/notification/bill/{bill_id}/send/`

Retrieves bill and sends it to customer email

#### 8. Send Bill Notification
**POST** `/api/notification/bill/{bill_id}/notify/`

Sends notification about the bill

---

## 👥 ADMIN SERVICE APIs

### Dashboard Endpoints

#### 1. Customer Dashboard
**GET** `/api/admin/dashboard/customer/`

**Authentication**: Customer role required

**Response**:
```json
{
  "vehicles": [...],
  "appointments": [...],
  "services": [...],
  "notifications": [...]
}
```

#### 2. Employee Dashboard
**GET** `/api/admin/dashboard/employee/`

**Authentication**: Employee role required

**Response**:
```json
{
  "assigned_services": [...],
  "time_logs": [...],
  "notifications": [...]
}
```

#### 3. Admin Dashboard
**GET** `/api/admin/dashboard/admin/`

**Authentication**: Admin role required

**Response**:
```json
{
  "total_services": 10,
  "pending_services": 3,
  "in_progress_services": 5,
  "completed_services": 2,
  "total_appointments": 15,
  "total_employees": 5,
  "recent_services": [...],
  "recent_appointments": [...]
}
```

---

### User Management

#### 4. List Users
**GET** `/api/admin/users/`

#### 5. Get User Details
**GET** `/api/admin/users/{user_id}/`

#### 6. Create User
**POST** `/api/admin/users/`
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "secure123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer"  // customer, employee, or admin
}
```

#### 7. Update User
**PUT/PATCH** `/api/admin/users/{user_id}/`

#### 8. Delete User
**DELETE** `/api/admin/users/{user_id}/`

---

### Employee Management

#### 9. List Employees
**GET** `/api/admin/employees/`

#### 10. Get Employee Details
**GET** `/api/admin/employees/{employee_id}/`

#### 11. Create Employee
**POST** `/api/admin/employees/`
```json
{
  "user": "user-uuid",
  "employee_id": "EMP001",
  "specialization": "Engine Repair",
  "hire_date": "2024-01-01",
  "hourly_rate": 25.00
}
```

---

### Vehicle Management

#### 12. List Vehicles
**GET** `/api/admin/vehicles/`

#### 13. Get Vehicle Details
**GET** `/api/admin/vehicles/{vehicle_id}/`

#### 14. Create Vehicle
**POST** `/api/admin/vehicles/`
```json
{
  "owner": "customer-user-uuid",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "license_plate": "ABC123",
  "vin": "1234567890ABCDEFG",
  "color": "Blue",
  "mileage": 50000
}
```

#### 15. Update Vehicle
**PUT/PATCH** `/api/admin/vehicles/{vehicle_id}/`

#### 16. Delete Vehicle
**DELETE** `/api/admin/vehicles/{vehicle_id}/`

---

### Appointment Management

#### 17. List Appointments
**GET** `/api/admin/appointments/`

#### 18. Get Appointment Details
**GET** `/api/admin/appointments/{appointment_id}/`

#### 19. Create Appointment
**POST** `/api/admin/appointments/`
```json
{
  "customer": "customer-user-uuid",
  "vehicle": "vehicle-uuid",
  "appointment_date": "2024-12-01T10:00:00Z",
  "service_type": "Oil Change",
  "description": "Regular maintenance",
  "status": "pending"
}
```

#### 20. Update Appointment
**PUT/PATCH** `/api/admin/appointments/{appointment_id}/`

#### 21. Delete Appointment
**DELETE** `/api/admin/appointments/{appointment_id}/`

---

### Service Management

#### 22. List Services
**GET** `/api/admin/services/`

#### 23. Get Service Details
**GET** `/api/admin/services/{service_id}/`

#### 24. Create Service
**POST** `/api/admin/services/`
```json
{
  "customer": "customer-user-uuid",
  "vehicle": "vehicle-uuid",
  "appointment": "appointment-uuid",
  "service_type": "repair",
  "description": "Brake system repair",
  "estimated_cost": 300.00,
  "estimated_hours": 3.0,
  "status": "pending"
}
```

#### 25. Update Service
**PUT/PATCH** `/api/admin/services/{service_id}/`

#### 26. Delete Service
**DELETE** `/api/admin/services/{service_id}/`

#### 27. Update Service Progress (Employee Only)
**POST** `/api/admin/services/{service_id}/update_progress/`

**Authentication**: Employee must be assigned to the service

```json
{
  "progress_percentage": 75,
  "notes": "Brake pads replaced, testing alignment"
}
```

#### 28. Update Service Status (Employee Only)
**POST** `/api/admin/services/{service_id}/update_status/`

**Authentication**: Employee must be assigned to the service

```json
{
  "status": "in_progress"  // pending, in_progress, completed, cancelled
}
```

---

### Service Assignment Management

#### 29. List Service Assignments
**GET** `/api/admin/service-assignments/`

#### 30. Create Service Assignment
**POST** `/api/admin/service-assignments/`
```json
{
  "service": "service-uuid",
  "employee": "employee-uuid"
}
```

---

### Time Log Management

#### 31. List Time Logs
**GET** `/api/admin/time-logs/`

#### 32. Create Time Log
**POST** `/api/admin/time-logs/`
```json
{
  "service": "service-uuid",
  "employee": "employee-uuid",
  "start_time": "2024-12-01T09:00:00Z",
  "end_time": "2024-12-01T12:00:00Z",
  "notes": "Completed brake inspection"
}
```

---

### Progress Update Management

#### 33. List Progress Updates
**GET** `/api/admin/progress-updates/`

#### 34. Create Progress Update
**POST** `/api/admin/progress-updates/`
```json
{
  "service": "service-uuid",
  "employee": "employee-uuid",
  "progress_percentage": 50,
  "notes": "Initial diagnostics completed"
}
```

---

### Modification Request Management

#### 35. List Modification Requests
**GET** `/api/admin/modification-requests/`

#### 36. Create Modification Request
**POST** `/api/admin/modification-requests/`
```json
{
  "service": "service-uuid",
  "requested_by": "customer-user-uuid",
  "modification_type": "upgrade",
  "description": "Add performance exhaust",
  "estimated_cost": 500.00,
  "status": "pending"
}
```

---

### Part Management

#### 37. List Parts
**GET** `/api/admin/parts/`

#### 38. Create Part
**POST** `/api/admin/parts/`
```json
{
  "part_number": "BRK-001",
  "name": "Brake Pad Set",
  "description": "Premium brake pads",
  "unit_price": 75.00,
  "quantity_in_stock": 50
}
```

---

### Service Part Management

#### 39. List Service Parts
**GET** `/api/admin/service-parts/`

#### 40. Create Service Part
**POST** `/api/admin/service-parts/`
```json
{
  "service": "service-uuid",
  "part": "part-uuid",
  "quantity_used": 2,
  "notes": "Replaced front brake pads"
}
```

---

### Notification Management

#### 41. List Notifications
**GET** `/api/admin/notifications/`

#### 42. Create Notification
**POST** `/api/admin/notifications/`
```json
{
  "user": "user-uuid",
  "title": "Service Update",
  "message": "Your vehicle service is complete",
  "notification_type": "service_update"
}
```

---

## 🧪 Testing in Postman

### Setup Steps:

1. **Create a new Collection**: "Automobile Service API"

2. **Set Authorization**:
   - Type: Basic Auth
   - Username: `admin`
   - Password: `admin123`

3. **Set Environment Variables**:
   - `base_url`: `http://localhost:8000`
   - `admin_user`: `admin`
   - `admin_pass`: `admin123`

### Quick Test Sequence:

1. **Generate OTP**:
   - POST `{{base_url}}/api/notification/otp/generate/`
   - Body: `{"email": "test@example.com"}`

2. **Get Admin Dashboard**:
   - GET `{{base_url}}/api/admin/dashboard/admin/`
   - Auth: Basic (admin/admin123)

3. **List All Services**:
   - GET `{{base_url}}/api/admin/services/`

4. **List All Vehicles**:
   - GET `{{base_url}}/api/admin/vehicles/`

5. **Update Service Progress** (as Employee):
   - POST `{{base_url}}/api/admin/services/{service_id}/update_progress/`
   - Auth: Basic (mike_tech/employee123)
   - Body: `{"progress_percentage": 80, "notes": "Almost done"}`

---

## ✅ Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (login required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔧 Troubleshooting

### Issue: 404 Not Found
- ✅ Check URL has trailing slash: `/api/admin/services/` (not `/api/admin/services`)
- ✅ Verify correct base URL: `http://localhost:8000`

### Issue: 401 Unauthorized
- ✅ Add Basic Authentication in Postman
- ✅ Use correct credentials for the role

### Issue: 403 Forbidden
- ✅ Check user role matches endpoint requirements
- ✅ For service updates, employee must be assigned to the service

### Issue: Connection Refused
- ✅ Check Docker containers are running: `docker-compose ps`
- ✅ Restart containers: `docker-compose restart`

---

## 📝 Notes

- All datetime fields use ISO 8601 format: `2024-12-01T10:00:00Z`
- All UUIDs should be provided as strings
- Trailing slashes are required on all endpoints
- Debug mode shows OTP codes in responses (disable in production)
