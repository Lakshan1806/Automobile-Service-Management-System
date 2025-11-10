# 💰 Bill Generation Logic - Documentation

## 🎯 Overview

The bill generation system fetches service and product data from `admin_service` and calculates the total bill automatically.

---

## 📋 Bill Generation Logic

### **Formula:**
```
Total Bill = Service Cost + Sum(Product Price × Quantity)
```

### **Step-by-Step Process:**

1. **Receive Request** with:
   - `service_id` (UUID)
   - `customer_email`
   - `products` array with `product_id` and `quantity`

2. **Fetch Service Data** from `admin_service.Service`:
   - Get service details by `service_id`
   - Extract `estimated_cost` (service price)
   - Extract `title` (service name)

3. **Fetch Product Data** from `admin_service.Part`:
   - For each product in the request:
     - Get product details by `product_id`
     - Extract `unit_price` (product price)
     - Extract `name` and `part_number`
     - Calculate: `product_total = unit_price × quantity`

4. **Calculate Total**:
   ```
   Total = service.estimated_cost + Σ(part.unit_price × quantity)
   ```

5. **Generate Bill**:
   - Create `Bill` record with total
   - Create `BillItem` records for each line item
   - Link items to bill
   - Return bill details

---

## 🔌 API Endpoint

### **Generate Bill**

**Endpoint:** `POST /api/notification/bill/generate/`

**Request Body:**
```json
{
  "service_id": "uuid-of-service-from-admin-service",
  "customer_email": "customer@example.com",
  "products": [
    {
      "product_id": "uuid-of-part-from-admin-service",
      "quantity": 2
    },
    {
      "product_id": "another-part-uuid",
      "quantity": 1
    }
  ]
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Bill generated successfully",
  "bill_id": "generated-bill-uuid",
  "service_number": "SRV-00001",
  "total_price": "450.00",
  "items": [
    {
      "name": "Service: Brake System Repair",
      "price": 200.00,
      "quantity": 1
    },
    {
      "name": "Brake Pad Set (BRK-001)",
      "price": 75.00,
      "quantity": 2
    },
    {
      "name": "Oil Filter (FLT-001)",
      "price": 25.00,
      "quantity": 1
    }
  ],
  "created_at": "2025-11-10T10:30:00Z"
}
```

**Calculation Breakdown:**
```
Service Cost:     $200.00  (1 × $200)
Brake Pads:       $150.00  (2 × $75)
Oil Filter:       $ 25.00  (1 × $25)
─────────────────────────────────
Total:            $375.00
```

**Error Response (404 Not Found):**
```json
{
  "error": "Service not found",
  "service_id": "invalid-uuid"
}
```

```json
{
  "error": "Product not found",
  "product_id": "invalid-product-uuid"
}
```

**Error Response (400 Bad Request):**
```json
{
  "service_id": ["This field is required."],
  "customer_email": ["Enter a valid email address."],
  "products": ["This field is required."]
}
```

---

## 📧 Send Bill Email

**Endpoint:** `POST /api/notification/bill/send/`

**Request Body:**
```json
{
  "bill_id": "bill-uuid-from-generate-response"
}
```

**Optional - Send to different email:**
```json
{
  "bill_id": "bill-uuid-from-generate-response",
  "email": "different@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Bill sent successfully to email",
  "bill_id": "bill-uuid",
  "email": "customer@example.com"
}
```

---

## 🧪 Testing Examples

### Example 1: Simple Service with Parts

**Scenario:** Oil change service with filter and oil

**Request:**
```json
POST /api/notification/bill/generate/

{
  "service_id": "service-uuid-123",
  "customer_email": "john@example.com",
  "products": [
    {
      "product_id": "oil-filter-uuid",
      "quantity": 1
    },
    {
      "product_id": "motor-oil-uuid",
      "quantity": 2
    }
  ]
}
```

**Expected Bill:**
```
Service: Oil Change          $50.00
Oil Filter (FLT-001) x1      $15.00
Motor Oil 5W-30 (OIL-001) x2 $40.00
─────────────────────────────────
Total:                       $105.00
```

---

### Example 2: Complex Repair with Multiple Parts

**Scenario:** Brake system repair

**Request:**
```json
POST /api/notification/bill/generate/

{
  "service_id": "brake-service-uuid",
  "customer_email": "jane@example.com",
  "products": [
    {
      "product_id": "brake-pad-uuid",
      "quantity": 2
    },
    {
      "product_id": "brake-fluid-uuid",
      "quantity": 1
    },
    {
      "product_id": "rotor-uuid",
      "quantity": 2
    }
  ]
}
```

**Expected Bill:**
```
Service: Brake System Repair     $200.00
Brake Pad Set (BRK-001) x2       $150.00
Brake Fluid (BFL-001) x1         $ 25.00
Brake Rotor (ROT-001) x2         $180.00
────────────────────────────────────────
Total:                           $555.00
```

---

## 📊 Data Flow Diagram

```
┌──────────────────┐
│ Technician       │
│ Service          │
│ (Node.js)        │
└────────┬─────────┘
         │
         │ 1. Send: service_id, product_ids, quantities
         │
         ▼
┌─────────────────────────────────────────────────┐
│  Billing-Notification Service (Django)          │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Generate Bill API                      │    │
│  │  /api/notification/bill/generate/       │    │
│  └────────┬───────────────────────────────┘    │
│           │                                      │
│           │ 2. Query Service                     │
│           ▼                                      │
│  ┌────────────────────┐                         │
│  │  admin_service     │                         │
│  │  Service Model     │                         │
│  │  ├─ title          │                         │
│  │  ├─ estimated_cost │                         │
│  │  └─ service_number │                         │
│  └────────┬───────────┘                         │
│           │                                      │
│           │ 3. Query Products                    │
│           ▼                                      │
│  ┌────────────────────┐                         │
│  │  admin_service     │                         │
│  │  Part Model        │                         │
│  │  ├─ name           │                         │
│  │  ├─ part_number    │                         │
│  │  └─ unit_price     │                         │
│  └────────┬───────────┘                         │
│           │                                      │
│           │ 4. Calculate Total                   │
│           │    Total = Service + Σ(Part × Qty)  │
│           │                                      │
│           ▼                                      │
│  ┌────────────────────┐                         │
│  │  notification_svc  │                         │
│  │  Bill Model        │                         │
│  │  ├─ bill_id        │                         │
│  │  ├─ customer_email │                         │
│  │  ├─ total_price    │                         │
│  │  └─ items[]        │                         │
│  └────────┬───────────┘                         │
│           │                                      │
│           │ 5. Return Bill                       │
│           ▼                                      │
│  ┌────────────────────────────────────────┐    │
│  │  Response with bill_id & total         │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
         │
         │ 6. Bill Details
         ▼
┌──────────────────┐
│ Technician       │
│ Service          │
│ (Response)       │
└──────────────────┘
```

---

## 🗄️ Database Models Used

### From `admin_service`:

**Service Model:**
```python
class Service(models.Model):
    id = models.UUIDField(primary_key=True)
    service_number = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2)
    # ... other fields
```

**Part Model:**
```python
class Part(models.Model):
    id = models.UUIDField(primary_key=True)
    part_number = models.CharField(max_length=50)
    name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    # ... other fields
```

### From `notification_service`:

**Bill Model:**
```python
class Bill(models.Model):
    bill_id = models.UUIDField(primary_key=True)
    customer_email = models.EmailField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
```

**BillItem Model:**
```python
class BillItem(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
```

---

## 🔍 Validation Rules

### Service ID:
- ✅ Must be a valid UUID
- ✅ Must exist in `admin_service.Service` table
- ❌ Returns 404 if not found

### Product IDs:
- ✅ Must be valid UUIDs
- ✅ Must exist in `admin_service.Part` table
- ❌ Returns 404 with specific product_id if not found

### Quantities:
- ✅ Must be positive integers (≥ 1)
- ❌ Returns 400 if invalid

### Email:
- ✅ Must be valid email format
- ❌ Returns 400 if invalid

---

## 📝 Complete Workflow Example

### Step 1: Get Test Data

First, get existing service and part UUIDs:

```bash
# Get services
GET http://localhost:8000/api/admin/services/

# Get parts
GET http://localhost:8000/api/admin/parts/
```

### Step 2: Generate Bill

```bash
POST http://localhost:8000/api/notification/bill/generate/
Content-Type: application/json

{
  "service_id": "c5e9b8a0-1234-5678-90ab-cdef12345678",
  "customer_email": "customer@example.com",
  "products": [
    {
      "product_id": "a1b2c3d4-1234-5678-90ab-cdef12345678",
      "quantity": 2
    }
  ]
}
```

### Step 3: Send Bill

```bash
POST http://localhost:8000/api/notification/bill/send/
Content-Type: application/json

{
  "bill_id": "bill-uuid-from-step-2"
}
```

### Step 4: Verify (Optional)

```bash
GET http://localhost:8000/api/notification/bill/bill-uuid-from-step-2/
```

---

## ⚠️ Important Notes

1. **Service Cost**: If `estimated_cost` is 0 or NULL, only product costs are calculated
2. **Product Prices**: Prices are fetched from `Part.unit_price` at time of bill generation
3. **Email**: Bill is sent to the email provided in the generate request
4. **Currency**: All prices are in the system's default currency (no conversion)
5. **Decimal Precision**: All calculations maintain 2 decimal places

---

## 🚀 Integration with Technician Service

### Technician Service Should Send:

```javascript
// Example Node.js code for technician-service
const axios = require('axios');

async function generateBill(serviceId, customerEmail, products) {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/notification/bill/generate/',
      {
        service_id: serviceId,
        customer_email: customerEmail,
        products: products // [{product_id, quantity}, ...]
      }
    );
    
    console.log('Bill generated:', response.data.bill_id);
    console.log('Total:', response.data.total_price);
    
    // Optionally send bill immediately
    await sendBill(response.data.bill_id);
    
    return response.data;
  } catch (error) {
    console.error('Bill generation failed:', error.response.data);
    throw error;
  }
}

async function sendBill(billId) {
  const response = await axios.post(
    'http://localhost:8000/api/notification/bill/send/',
    { bill_id: billId }
  );
  console.log('Bill sent:', response.data);
}
```

---

## ✅ Summary

**What Changed:**
- ✅ Bill generation now fetches service price from `admin_service.Service`
- ✅ Product prices fetched from `admin_service.Part`
- ✅ Automatic calculation: `Total = Service Cost + Σ(Product Price × Quantity)`
- ✅ Detailed bill items showing each component
- ✅ Validation for service_id and product_ids
- ✅ Send bill email remains unchanged

**What Stayed the Same:**
- ✅ OTP generation/verification (unchanged)
- ✅ Bill send endpoint (unchanged)
- ✅ Get bill endpoint (unchanged)
- ✅ Notify endpoint (unchanged)

**Ready to Use! 🎉**
