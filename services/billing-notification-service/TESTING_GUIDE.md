# 🚀 Simplified API Testing Guide

## ✅ How to Verify Docker is Working

### Method 1: Health Check Endpoint
Open in browser or Postman (GET request):
```
http://localhost:8000/
```
or
```
http://localhost:8000/health/
```

**Expected Response:**
```json
{
  "status": "running",
  "service": "Automobile Service Management - Billing & Notification",
  "database": "healthy",
  "endpoints": {
    "admin": "/admin/",
    "notification_api": "/api/notification/",
    "admin_api": "/api/admin/",
    "health": "/health/"
  }
}
```

✅ If you see this, **Docker is working perfectly!**

---

### Method 2: Check Docker Containers
```powershell
docker-compose ps
```

**Expected Output:**
```
NAME                STATUS
automobile_django   Up
automobile_mysql    Up (healthy)
```

---

### Method 3: View Live Logs
```powershell
docker-compose logs -f web
```

You should see:
```
Starting development server at http://0.0.0.0:8000/
```

---

## 📧 Notification Service - Only 4 Billing Endpoints You Need

### 1. Generate Bill
**POST** `http://localhost:8000/api/notification/bill/generate/`

**Request Body:**
```json
{
  "customer_email": "customer@example.com",
  "items": [
    {
      "name": "Oil Change",
      "price": 50.00,
      "quantity": 1
    },
    {
      "name": "Brake Pads",
      "price": 75.00,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bill generated successfully",
  "bill_id": "077305d1-2e45-42aa-8d2d-f0293554b526",
  "total_price": "200.00",
  "created_at": "2024-11-06T10:30:00Z"
}
```

📝 **Save the `bill_id` for next steps!**

---

### 2. Send Bill Email
**POST** `http://localhost:8000/api/notification/bill/send/`

**Request Body:**
```json
{
  "bill_id": "077305d1-2e45-42aa-8d2d-f0293554b526"
}
```

**Optional - Send to different email:**
```json
{
  "bill_id": "077305d1-2e45-42aa-8d2d-f0293554b526",
  "email": "different@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bill sent successfully to email",
  "bill_id": "077305d1-2e45-42aa-8d2d-f0293554b526",
  "email": "customer@example.com"
}
```

---

### 3. Get Bill Details
**GET** `http://localhost:8000/api/notification/bill/{bill_id}/`

**Example:**
```
GET http://localhost:8000/api/notification/bill/077305d1-2e45-42aa-8d2d-f0293554b526/
```

**Response:**
```json
{
  "bill_id": "077305d1-2e45-42aa-8d2d-f0293554b526",
  "customer_email": "customer@example.com",
  "total_price": "200.00",
  "created_at": "2024-11-06T10:30:00Z",
  "items": [
    {
      "name": "Oil Change",
      "price": "50.00",
      "quantity": 1,
      "total": "50.00"
    },
    {
      "name": "Brake Pads",
      "price": "75.00",
      "quantity": 2,
      "total": "150.00"
    }
  ],
  "email_sent": true,
  "email_status": "Email sent successfully"
}
```

⚠️ **Note:** This endpoint also sends the bill email automatically!

---

### 4. Send Bill Notification with OTP
**POST** `http://localhost:8000/api/notification/bill/{bill_id}/notify/`

**Example:**
```
POST http://localhost:8000/api/notification/bill/077305d1-2e45-42aa-8d2d-f0293554b526/notify/
```

**Request Body:**
```json
{
  "customer_email": "customer@example.com",
  "total_amount": 200.00,
  "items": [
    {
      "name": "Oil Change",
      "price": 50.00,
      "quantity": 1,
      "subtotal": 50.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456",
  "email": "customer@example.com"
}
```

---

## 🧪 Step-by-Step Testing in Postman

### Step 1: Verify Docker is Running
```
GET http://localhost:8000/health/
```
✅ Should return status: "running"

### Step 2: Generate a Bill
```
POST http://localhost:8000/api/notification/bill/generate/

Body:
{
  "customer_email": "test@example.com",
  "items": [
    {"name": "Service A", "price": 100, "quantity": 1}
  ]
}
```
✅ Copy the `bill_id` from response

### Step 3: Send Bill Email
```
POST http://localhost:8000/api/notification/bill/send/

Body:
{
  "bill_id": "paste-bill-id-here"
}
```
✅ Should return success: true

### Step 4: Get Bill Details
```
GET http://localhost:8000/api/notification/bill/paste-bill-id-here/
```
✅ Should return full bill details

### Step 5: Send Notification
```
POST http://localhost:8000/api/notification/bill/paste-bill-id-here/notify/

Body:
{
  "customer_email": "test@example.com",
  "total_amount": 100
}
```
✅ Should return OTP

---

## 🔧 Troubleshooting

### ❌ Error: "Connection refused"
**Fix:** Check Docker is running
```powershell
docker-compose ps
docker-compose start
```

### ❌ Error: 404 Not Found
**Fix:** Make sure URL is correct with trailing slash
- ✅ Correct: `http://localhost:8000/api/notification/bill/send/`
- ❌ Wrong: `http://localhost:8000/api/notification/bill/send`

### ❌ Error: "Bill not found"
**Fix:** Make sure you're using the correct bill_id from the generate response

### ❌ Docker not responding
**Fix:** Restart containers
```powershell
docker-compose restart
```

---

## 📊 Quick Status Check Commands

```powershell
# Check if containers are running
docker-compose ps

# View Django logs
docker-compose logs web

# View MySQL logs
docker-compose logs db

# Restart everything
docker-compose restart

# Stop everything
docker-compose down

# Start everything fresh
docker-compose up -d
```

---

## ✅ Summary - Only These 4 Endpoints for Billing:

1. **Generate Bill**: POST `/api/notification/bill/generate/`
2. **Send Bill Email**: POST `/api/notification/bill/send/`
3. **Get Bill**: GET `/api/notification/bill/{bill_id}/`
4. **Send Notification**: POST `/api/notification/bill/{bill_id}/notify/`

**All working perfectly in Docker! 🎉**
