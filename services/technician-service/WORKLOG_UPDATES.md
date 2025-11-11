# Worklog Updates - Service & Product Tracking

**Date:** November 11, 2025  
**Feature:** Track services and products used in worklogs

---

## 🎯 Overview

Updated worklog functionality to track:
- ✅ **Service performed** (service_id from admin-service)
- ✅ **Products/parts used** (product_id, quantity from admin-service)
- ✅ **Automatic cost calculation** (service price + products cost)
- ✅ **Stock updates** (decrements stock in admin-service when products added)

---

## 📊 Updated Worklog Schema

```javascript
{
  // Existing fields
  task: ObjectId (required),
  technician: ObjectId,
  startTime: Date (required),
  endTime: Date,
  durationMinutes: Number, // Auto-calculated
  notes: String,
  
  // NEW: Service information
  service: {
    service_id: Number,      // From admin_service
    name: String,
    price: Number
  },
  
  // NEW: Products used
  productsUsed: [
    {
      product_id: Number,    // From admin_service
      name: String,
      quantityUsed: Number,
      unitPrice: Number,
      totalPrice: Number     // unitPrice * quantityUsed
    }
  ],
  
  // NEW: Total cost
  totalCost: Number,         // service.price + sum(productsUsed.totalPrice)
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 New API Endpoints

### **1. Add Service to Worklog**

```http
POST /api/worklogs/:id/service
```

**Request Body:**
```json
{
  "serviceId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service added to worklog",
  "data": {
    "_id": "worklog_id",
    "task": "task_id",
    "startTime": "2025-11-15T09:00:00Z",
    "endTime": "2025-11-15T11:00:00Z",
    "durationMinutes": 120,
    "service": {
      "service_id": 1,
      "name": "Oil Change",
      "price": 2500
    },
    "productsUsed": [],
    "totalCost": 2500,
    "notes": "Completed oil change"
  }
}
```

---

### **2. Add Product to Worklog**

```http
POST /api/worklogs/:id/products
```

**Request Body:**
```json
{
  "productId": 1,
  "quantityUsed": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added to worklog successfully",
  "data": {
    "_id": "worklog_id",
    "task": "task_id",
    "service": {
      "service_id": 1,
      "name": "Oil Change",
      "price": 2500
    },
    "productsUsed": [
      {
        "product_id": 1,
        "name": "Engine Oil 5W-30",
        "quantityUsed": 2,
        "unitPrice": 450,
        "totalPrice": 900
      }
    ],
    "totalCost": 3400,  // 2500 + 900
    "notes": "Used 2 bottles of engine oil"
  }
}
```

**What Happens:**
1. ✅ Fetches product details from admin-service
2. ✅ Checks stock availability
3. ✅ Calculates costs (unitPrice × quantityUsed)
4. ✅ Adds product to worklog
5. ✅ Updates stock in admin-service (decrements by quantityUsed)
6. ✅ Recalculates totalCost

---

### **3. Get Worklog by ID**

```http
GET /api/worklogs/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Worklog fetched",
  "data": {
    "_id": "worklog_id",
    "task": "task_id",
    "technician": "tech_id",
    "startTime": "2025-11-15T09:00:00Z",
    "endTime": "2025-11-15T11:00:00Z",
    "durationMinutes": 120,
    "service": {
      "service_id": 1,
      "name": "Oil Change",
      "price": 2500
    },
    "productsUsed": [
      {
        "product_id": 1,
        "name": "Engine Oil 5W-30",
        "quantityUsed": 2,
        "unitPrice": 450,
        "totalPrice": 900
      },
      {
        "product_id": 2,
        "name": "Oil Filter",
        "quantityUsed": 1,
        "unitPrice": 150,
        "totalPrice": 150
      }
    ],
    "totalCost": 3550,  // 2500 + 900 + 150
    "notes": "Completed oil change with filter replacement"
  }
}
```

---

## 🔄 Complete Workflow Example

### **Scenario: Technician performs Oil Change**

```bash
# Step 1: Create worklog when starting work
POST /api/worklogs
{
  "task": "673069fe13afb542cfcde123",
  "technician": "67306a2e13afb542cfcde125",
  "startTime": "2025-11-15T09:00:00Z",
  "notes": "Starting oil change for Honda Civic"
}

# Response:
{
  "_id": "67306c3f13afb542cfcde127",
  "task": "673069fe13afb542cfcde123",
  "startTime": "2025-11-15T09:00:00Z",
  "productsUsed": [],
  "totalCost": 0
}

# Step 2: Add the service being performed
POST /api/worklogs/67306c3f13afb542cfcde127/service
{
  "serviceId": 1  // Oil Change service
}

# Response:
{
  "service": {
    "service_id": 1,
    "name": "Oil Change",
    "price": 2500
  },
  "totalCost": 2500
}

# Step 3: Add products used during work
POST /api/worklogs/67306c3f13afb542cfcde127/products
{
  "productId": 1,     // Engine Oil
  "quantityUsed": 2
}

# Stock Update: Engine Oil stock goes from 50 → 48
# Response:
{
  "productsUsed": [
    {
      "product_id": 1,
      "name": "Engine Oil 5W-30",
      "quantityUsed": 2,
      "unitPrice": 450,
      "totalPrice": 900
    }
  ],
  "totalCost": 3400  // 2500 + 900
}

# Step 4: Add another product
POST /api/worklogs/67306c3f13afb542cfcde127/products
{
  "productId": 2,     // Oil Filter
  "quantityUsed": 1
}

# Stock Update: Oil Filter stock goes from 100 → 99
# Response:
{
  "productsUsed": [
    {
      "product_id": 1,
      "name": "Engine Oil 5W-30",
      "quantityUsed": 2,
      "unitPrice": 450,
      "totalPrice": 900
    },
    {
      "product_id": 2,
      "name": "Oil Filter",
      "quantityUsed": 1,
      "unitPrice": 150,
      "totalPrice": 150
    }
  ],
  "totalCost": 3550  // 2500 + 900 + 150
}

# Step 5: End work session
PUT /api/worklogs/67306c3f13afb542cfcde127
{
  "endTime": "2025-11-15T11:00:00Z",
  "notes": "Completed oil change with filter replacement. Customer satisfied."
}

# Final worklog:
{
  "_id": "67306c3f13afb542cfcde127",
  "task": "673069fe13afb542cfcde123",
  "technician": "67306a2e13afb542cfcde125",
  "startTime": "2025-11-15T09:00:00Z",
  "endTime": "2025-11-15T11:00:00Z",
  "durationMinutes": 120,
  "service": {
    "service_id": 1,
    "name": "Oil Change",
    "price": 2500
  },
  "productsUsed": [
    {
      "product_id": 1,
      "name": "Engine Oil 5W-30",
      "quantityUsed": 2,
      "unitPrice": 450,
      "totalPrice": 900
    },
    {
      "product_id": 2,
      "name": "Oil Filter",
      "quantityUsed": 1,
      "unitPrice": 150,
      "totalPrice": 150
    }
  ],
  "totalCost": 3550,
  "notes": "Completed oil change with filter replacement. Customer satisfied."
}
```

---

## 📋 API Reference Summary

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/worklogs` | Create new worklog | `{ task, startTime, technician?, notes? }` |
| `GET` | `/api/worklogs/:id` | Get worklog by ID | - |
| `GET` | `/api/worklogs/task/:taskId` | Get all worklogs for a task | - |
| `PUT` | `/api/worklogs/:id` | Update worklog | `{ endTime?, notes?, ... }` |
| `POST` | `/api/worklogs/:id/service` | Add service to worklog | `{ serviceId }` |
| `POST` | `/api/worklogs/:id/products` | Add product to worklog | `{ productId, quantityUsed }` |

---

## 🎨 Key Features

### **1. Automatic Cost Calculation**
- Service cost + Products cost = Total cost
- Recalculated automatically on save

### **2. Stock Management**
- Adding products updates stock in admin-service
- Stock validation before adding
- Prevents negative stock

### **3. Multiple Products**
- Add multiple products to single worklog
- If same product added twice, quantities are combined

### **4. Service Tracking**
- Links worklog to specific service from admin-service
- Caches service name and price

### **5. Time Tracking**
- Duration auto-calculated from start/end times
- Measured in minutes

---

## ⚠️ Important Notes

### **Stock Updates:**
```javascript
// When adding product to worklog:
Current Stock: 50
Quantity Used: 2
New Stock: 48  // Updated in admin-service MySQL
```

### **Cost Breakdown:**
```javascript
Service Price:     ₹2,500
Product 1 (×2):    ₹900   (₹450 × 2)
Product 2 (×1):    ₹150   (₹150 × 1)
─────────────────────────
Total Cost:        ₹3,550
```

### **Adding Same Product Multiple Times:**
```javascript
// First add: productId=1, quantityUsed=2
productsUsed: [{ product_id: 1, quantityUsed: 2, totalPrice: 900 }]

// Second add: productId=1, quantityUsed=1
productsUsed: [{ product_id: 1, quantityUsed: 3, totalPrice: 1350 }]
// Quantities and prices are combined
```

---

## 🧪 Testing

### **Test 1: Create Worklog**
```bash
curl -X POST http://localhost:3016/api/worklogs \
  -H "Content-Type: application/json" \
  -d '{
    "task": "673069fe13afb542cfcde123",
    "startTime": "2025-11-15T09:00:00Z"
  }'
```

### **Test 2: Add Service**
```bash
curl -X POST http://localhost:3016/api/worklogs/{worklog_id}/service \
  -H "Content-Type: application/json" \
  -d '{ "serviceId": 1 }'
```

### **Test 3: Add Product**
```bash
curl -X POST http://localhost:3016/api/worklogs/{worklog_id}/products \
  -H "Content-Type: application/json" \
  -d '{ "productId": 1, "quantityUsed": 2 }'
```

### **Test 4: Get Worklog**
```bash
curl http://localhost:3016/api/worklogs/{worklog_id}
```

### **Test 5: Verify Stock Update**
```bash
# Check stock before
curl http://localhost:3016/api/parts/1

# Add product to worklog
curl -X POST http://localhost:3016/api/worklogs/{worklog_id}/products \
  -H "Content-Type: application/json" \
  -d '{ "productId": 1, "quantityUsed": 2 }'

# Check stock after (should be decreased by 2)
curl http://localhost:3016/api/parts/1
```

---

## 🔍 Error Handling

### **Insufficient Stock**
```json
{
  "success": false,
  "message": "Insufficient stock. Available: 5, Required: 10",
  "error": "..."
}
```

### **Service Not Found**
```json
{
  "success": false,
  "message": "Service not found in admin service",
  "error": "..."
}
```

### **Product Not Found**
```json
{
  "success": false,
  "message": "Product not found in admin service",
  "error": "..."
}
```

### **Worklog Not Found**
```json
{
  "success": false,
  "message": "Worklog not found",
  "error": "..."
}
```

---

## 📊 Data Flow

```
1. Technician creates worklog
   └→ MongoDB: Worklog saved

2. Technician adds service
   └→ Admin Service: Fetch service details (MySQL)
   └→ MongoDB: Update worklog with service info

3. Technician adds product
   └→ Admin Service: Fetch product details (MySQL)
   └→ Admin Service: Check stock
   └→ Admin Service: Update stock (decrease)
   └→ MongoDB: Update worklog with product info
   └→ Auto-calculate totalCost

4. Technician ends work
   └→ MongoDB: Update endTime
   └→ Auto-calculate durationMinutes
```

---

## ✅ Summary

### **What Changed:**
1. ✅ Worklog model updated with `service` and `productsUsed` fields
2. ✅ Added `totalCost` auto-calculation
3. ✅ New endpoints: `/service` and `/products`
4. ✅ Stock updates to admin-service when products added
5. ✅ Service validation from admin-service

### **Benefits:**
- 📊 Complete cost tracking per worklog
- 🔧 Service-level detail for each work session
- 📦 Product usage tracking with quantities
- 💰 Automatic cost calculation
- 📉 Real-time stock management
- 🎯 Better billing and inventory control

---

**Status:** ✅ **IMPLEMENTED**  
**Ready for Testing:** ✅ **YES**
