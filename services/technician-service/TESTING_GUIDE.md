# Technician Service - Complete Testing Guide (Thunder Client)

## 📋 Prerequisites

Before testing, ensure these services are running:

```bash
# Terminal 1 - Admin Service (Port 8000)
cd services/admin-service
python manage.py runserver

# Terminal 2 - Manager Service (Port 3002)
cd services/manager-service
npm start

# Terminal 3 - Technician Service (Port 3016)
cd services/technician-service
npm start
```

### Database Setup Required:

1. **Admin Service MySQL** should have:
   - Services in `admin_services_service` table
   - Products in `admin_services_product` table

2. **Manager Service MongoDB** should have:
   - Technicians with assigned tasks
   - Appointments

---

## 🧪 Testing Flow (Recommended Order)

### Phase 1: Setup & Verification
1. Health Check
2. Fetch Services from Admin
3. Fetch Products from Admin

### Phase 2: Task Management
4. Get Assigned Tasks for Technician
5. Update Task Status
6. Add Progress to Task

### Phase 3: Worklog Operations (Core Feature)
7. Create Worklog
8. Add Service to Worklog
9. Add Products to Worklog
10. Get Worklog Details
11. Complete Worklog

### Phase 4: Additional Features
12. Local Appointments CRUD
13. Real-time WebSocket Testing

---

## 📝 Thunder Client Test Collection

### Test 1: Health Check ✅

**Request:**
```
GET http://localhost:3016/
```

**Expected Response:**
```json
{
  "ok": true,
  "message": "Technician Management API"
}
```

**Validates:** Service is running

---

### Test 2: Fetch All Services from Admin 🔧

**Request:**
```
GET http://localhost:3016/api/services
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Services fetched",
  "data": [
    {
      "service_id": 1,
      "name": "Oil Change",
      "description": "Complete oil change service",
      "price": 500,
      "category": "maintenance",
      "estimated_duration": 60
    },
    {
      "service_id": 2,
      "name": "Brake Repair",
      "description": "Brake system repair",
      "price": 1200,
      "category": "repair",
      "estimated_duration": 120
    }
  ]
}
```

**Validates:** Integration with admin-service working

**Troubleshooting:**
- If fails: Check admin-service is running on port 8000
- Verify MySQL has data in `admin_services_service` table

---

### Test 3: Fetch All Products/Parts from Admin 🔩

**Request:**
```
GET http://localhost:3016/api/parts
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Products fetched",
  "data": [
    {
      "product_id": 5,
      "name": "Engine Oil 5W-30",
      "description": "Premium engine oil",
      "price": 125,
      "stock": 50,
      "category": "fluids"
    },
    {
      "product_id": 6,
      "name": "Brake Pads",
      "description": "Front brake pads",
      "price": 350,
      "stock": 20,
      "category": "brakes"
    }
  ]
}
```

**Validates:** Product integration with admin-service

**Note:** Stock values will be used in worklog tests

---

### Test 4: Get Assigned Tasks for Technician 📋

**Request:**
```
GET http://localhost:3016/api/tasks?technicianId=TECH001
```

**Query Parameters:**
- `technicianId`: TECH001 (or any valid technician ID from manager-service)

**Expected Response:**
```json
{
  "success": true,
  "message": "Fetched 2 assigned tasks from manager-service",
  "data": [
    {
      "_id": "673123abc456def789012345",
      "appointmentId": "673000abc111def222333444",
      "customId": "APT-001",
      "title": "Oil Change - Toyota Camry",
      "description": "Regular maintenance",
      "customer": {
        "name": "John Doe",
        "phone": "+1234567890",
        "email": "john@example.com"
      },
      "vehicle": {
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "licensePlate": "XYZ-1234"
      },
      "serviceType": "Oil Change",
      "status": "assigned",
      "startDate": "2025-11-15",
      "source": "manager_service"
    }
  ]
}
```

**Validates:** 
- Integration with manager-service
- Task fetching logic
- Data transformation

**Save for next tests:** Copy a `_id` value (task ID)

**Troubleshooting:**
- Empty array? Check manager-service has technician with assigned tasks
- Error? Verify manager-service is running on port 3002

---

### Test 5: Create Worklog for Task 📝

**Request:**
```
POST http://localhost:3016/api/worklogs
Content-Type: application/json
```

**Body:**
```json
{
  "task": "673123abc456def789012345",
  "startTime": "2025-11-11T08:00:00Z",
  "notes": "Starting work on oil change"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Worklog created",
  "data": {
    "_id": "674aaa111bbb222ccc333444",
    "task": "673123abc456def789012345",
    "startTime": "2025-11-11T08:00:00.000Z",
    "endTime": null,
    "duration": 0,
    "notes": "Starting work on oil change",
    "service": null,
    "productsUsed": [],
    "totalCost": 0,
    "createdAt": "2025-11-11T08:00:00.000Z",
    "updatedAt": "2025-11-11T08:00:00.000Z"
  }
}
```

**Validates:** Worklog creation in MongoDB

**Save for next tests:** Copy the worklog `_id`

---

### Test 6: Add Service to Worklog ⚙️

**Request:**
```
POST http://localhost:3016/api/worklogs/674aaa111bbb222ccc333444/service
Content-Type: application/json
```

**Body:**
```json
{
  "serviceId": 1
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Service added to worklog",
  "data": {
    "_id": "674aaa111bbb222ccc333444",
    "task": "673123abc456def789012345",
    "startTime": "2025-11-11T08:00:00.000Z",
    "endTime": null,
    "duration": 0,
    "notes": "Starting work on oil change",
    "service": {
      "service_id": 1,
      "name": "Oil Change",
      "price": 500
    },
    "productsUsed": [],
    "totalCost": 500,
    "createdAt": "2025-11-11T08:00:00.000Z",
    "updatedAt": "2025-11-11T08:05:00.000Z"
  }
}
```

**Validates:**
- ✅ Service fetched from admin-service
- ✅ Service added to worklog
- ✅ Total cost calculated (500)

**Real-time Update:** If Socket.IO client connected, receives:
```json
{
  "type": "service-added",
  "worklogId": "674aaa111bbb222ccc333444",
  "taskId": "673123abc456def789012345",
  "service": {
    "service_id": 1,
    "name": "Oil Change",
    "price": 500
  },
  "totalCost": 500,
  "timestamp": "2025-11-11T08:05:00.000Z"
}
```

---

### Test 7: Add First Product to Worklog 🔧

**Request:**
```
POST http://localhost:3016/api/worklogs/674aaa111bbb222ccc333444/products
Content-Type: application/json
```

**Body:**
```json
{
  "productId": 5,
  "quantityUsed": 2
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product added to worklog successfully",
  "data": {
    "_id": "674aaa111bbb222ccc333444",
    "task": "673123abc456def789012345",
    "startTime": "2025-11-11T08:00:00.000Z",
    "endTime": null,
    "duration": 0,
    "notes": "Starting work on oil change",
    "service": {
      "service_id": 1,
      "name": "Oil Change",
      "price": 500
    },
    "productsUsed": [
      {
        "product_id": 5,
        "name": "Engine Oil 5W-30",
        "quantityUsed": 2,
        "unitPrice": 125,
        "totalPrice": 250
      }
    ],
    "totalCost": 750,
    "createdAt": "2025-11-11T08:00:00.000Z",
    "updatedAt": "2025-11-11T08:10:00.000Z"
  }
}
```

**Validates:**
- ✅ Product fetched from admin-service
- ✅ Stock checked (50 >= 2)
- ✅ Product added to worklog
- ✅ Stock deducted in admin-service (50 - 2 = 48)
- ✅ Total cost recalculated (500 + 250 = 750)

**Real-time Update:**
```json
{
  "type": "product-added",
  "worklogId": "674aaa111bbb222ccc333444",
  "taskId": "673123abc456def789012345",
  "product": {
    "product_id": 5,
    "name": "Engine Oil 5W-30",
    "quantityUsed": 2,
    "unitPrice": 125,
    "totalPrice": 250
  },
  "totalCost": 750,
  "timestamp": "2025-11-11T08:10:00.000Z"
}
```

**Verify Stock Deduction:**
```
GET http://localhost:3016/api/parts
```
Check product_id 5 stock is now 48

---

### Test 8: Add Second Product to Worklog 🔩

**Request:**
```
POST http://localhost:3016/api/worklogs/674aaa111bbb222ccc333444/products
Content-Type: application/json
```

**Body:**
```json
{
  "productId": 6,
  "quantityUsed": 1
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product added to worklog successfully",
  "data": {
    "_id": "674aaa111bbb222ccc333444",
    "service": {
      "service_id": 1,
      "name": "Oil Change",
      "price": 500
    },
    "productsUsed": [
      {
        "product_id": 5,
        "name": "Engine Oil 5W-30",
        "quantityUsed": 2,
        "unitPrice": 125,
        "totalPrice": 250
      },
      {
        "product_id": 6,
        "name": "Brake Pads",
        "quantityUsed": 1,
        "unitPrice": 350,
        "totalPrice": 350
      }
    ],
    "totalCost": 1100
  }
}
```

**Validates:**
- ✅ Multiple products in worklog
- ✅ Total cost = 500 + 250 + 350 = 1100
- ✅ Stock deducted for product 6 (20 - 1 = 19)

---

### Test 9: Get Worklog Details 📊

**Request:**
```
GET http://localhost:3016/api/worklogs/674aaa111bbb222ccc333444
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Worklog fetched",
  "data": {
    "_id": "674aaa111bbb222ccc333444",
    "task": "673123abc456def789012345",
    "startTime": "2025-11-11T08:00:00.000Z",
    "endTime": null,
    "duration": 0,
    "notes": "Starting work on oil change",
    "service": {
      "service_id": 1,
      "name": "Oil Change",
      "price": 500
    },
    "productsUsed": [
      {
        "product_id": 5,
        "name": "Engine Oil 5W-30",
        "quantityUsed": 2,
        "unitPrice": 125,
        "totalPrice": 250
      },
      {
        "product_id": 6,
        "name": "Brake Pads",
        "quantityUsed": 1,
        "unitPrice": 350,
        "totalPrice": 350
      }
    ],
    "totalCost": 1100,
    "createdAt": "2025-11-11T08:00:00.000Z",
    "updatedAt": "2025-11-11T08:15:00.000Z"
  }
}
```

**Validates:** Full worklog with service and products

---

### Test 10: Complete Worklog (Add End Time) ✅

**Request:**
```
PUT http://localhost:3016/api/worklogs/674aaa111bbb222ccc333444
Content-Type: application/json
```

**Body:**
```json
{
  "endTime": "2025-11-11T10:30:00Z",
  "notes": "Oil change completed successfully. All fluids checked."
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Worklog updated",
  "data": {
    "_id": "674aaa111bbb222ccc333444",
    "task": "673123abc456def789012345",
    "startTime": "2025-11-11T08:00:00.000Z",
    "endTime": "2025-11-11T10:30:00.000Z",
    "duration": 150,
    "notes": "Oil change completed successfully. All fluids checked.",
    "service": {
      "service_id": 1,
      "name": "Oil Change",
      "price": 500
    },
    "productsUsed": [
      {
        "product_id": 5,
        "name": "Engine Oil 5W-30",
        "quantityUsed": 2,
        "unitPrice": 125,
        "totalPrice": 250
      },
      {
        "product_id": 6,
        "name": "Brake Pads",
        "quantityUsed": 1,
        "unitPrice": 350,
        "totalPrice": 350
      }
    ],
    "totalCost": 1100,
    "createdAt": "2025-11-11T08:00:00.000Z",
    "updatedAt": "2025-11-11T10:30:00.000Z"
  }
}
```

**Validates:**
- ✅ Duration auto-calculated (150 minutes = 2.5 hours)
- ✅ Notes updated
- ✅ End time recorded

---

### Test 11: Get All Worklogs for Task 📋

**Request:**
```
GET http://localhost:3016/api/worklogs/task/673123abc456def789012345
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Worklogs fetched",
  "data": [
    {
      "_id": "674aaa111bbb222ccc333444",
      "task": "673123abc456def789012345",
      "startTime": "2025-11-11T08:00:00.000Z",
      "endTime": "2025-11-11T10:30:00.000Z",
      "duration": 150,
      "service": {
        "service_id": 1,
        "name": "Oil Change",
        "price": 500
      },
      "productsUsed": [...],
      "totalCost": 1100
    }
  ]
}
```

**Validates:** Multiple worklogs per task support

---

### Test 12: Add Progress to Task 📝

**Request:**
```
POST http://localhost:3016/api/tasks/673123abc456def789012345/progress
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Oil drained, filter replaced, new oil added"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Progress added",
  "data": {
    "_id": "675progress123abc",
    "task": "673123abc456def789012345",
    "message": "Oil drained, filter replaced, new oil added",
    "createdBy": null,
    "timestamp": "2025-11-11T09:00:00.000Z"
  }
}
```

**Validates:** Progress tracking

**Real-time Update:**
```json
{
  "type": "progress-added",
  "taskId": "673123abc456def789012345",
  "progress": {
    "_id": "675progress123abc",
    "message": "Oil drained, filter replaced, new oil added",
    "createdBy": null,
    "timestamp": "2025-11-11T09:00:00.000Z"
  },
  "timestamp": "2025-11-11T09:00:00.000Z"
}
```

---

### Test 13: Update Task Status 🔄

**Request:**
```
PUT http://localhost:3016/api/tasks/673123abc456def789012345
Content-Type: application/json
```

**Body:**
```json
{
  "status": "completed"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task updated",
  "data": {
    "_id": "673123abc456def789012345",
    "status": "completed",
    "updatedAt": "2025-11-11T10:30:00.000Z"
  }
}
```

**Validates:** Task status management

**Real-time Update:**
```json
{
  "type": "status-changed",
  "taskId": "673123abc456def789012345",
  "status": "completed",
  "data": { "status": "completed" },
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

---

### Test 14: Test Insufficient Stock (Error Case) ❌

**Request:**
```
POST http://localhost:3016/api/worklogs/674aaa111bbb222ccc333444/products
Content-Type: application/json
```

**Body:**
```json
{
  "productId": 5,
  "quantityUsed": 100
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Insufficient stock. Available: 48, Required: 100",
  "error": "Insufficient stock. Available: 48, Required: 100"
}
```

**Validates:** Stock validation logic

---

### Test 15: Create Local Appointment 📅

**Request:**
```
POST http://localhost:3016/api/appointments
Content-Type: application/json
```

**Body:**
```json
{
  "customer": {
    "name": "Jane Smith",
    "phone": "+1987654321",
    "email": "jane@example.com"
  },
  "vehicle": {
    "make": "Honda",
    "model": "Civic",
    "year": 2021,
    "vin": "1HGBH41JXMN109186",
    "licensePlate": "ABC-5678"
  },
  "appointmentDate": "2025-11-20",
  "appointmentTime": "10:00 AM",
  "serviceType": "Brake Repair",
  "status": "scheduled"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment created",
  "data": {
    "_id": "676appointment123",
    "customer": {
      "name": "Jane Smith",
      "phone": "+1987654321",
      "email": "jane@example.com"
    },
    "vehicle": {
      "make": "Honda",
      "model": "Civic",
      "year": 2021,
      "vin": "1HGBH41JXMN109186",
      "licensePlate": "ABC-5678"
    },
    "appointmentDate": "2025-11-20",
    "appointmentTime": "10:00 AM",
    "serviceType": "Brake Repair",
    "status": "scheduled",
    "createdAt": "2025-11-11T11:00:00.000Z"
  }
}
```

**Validates:** Local appointment creation

---

### Test 16: Get Today's Appointments 📆

**Request:**
```
GET http://localhost:3016/api/appointments/today
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointments fetched",
  "data": []
}
```

**Note:** Will be empty unless appointment date is today

---

### Test 17: Get Upcoming Appointments 📅

**Request:**
```
GET http://localhost:3016/api/appointments/upcoming
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointments fetched",
  "data": [
    {
      "_id": "676appointment123",
      "customer": {
        "name": "Jane Smith",
        "phone": "+1987654321"
      },
      "vehicle": {
        "make": "Honda",
        "model": "Civic"
      },
      "appointmentDate": "2025-11-20",
      "appointmentTime": "10:00 AM",
      "serviceType": "Brake Repair",
      "status": "scheduled"
    }
  ]
}
```

**Validates:** Date filtering logic

---

## 🌐 WebSocket Testing (Socket.IO)

### Using Browser Console

**1. Open Browser Console** (Chrome DevTools)

**2. Load Socket.IO Client:**
```html
<!-- Create test.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>Socket.IO Test</h1>
  <div id="messages"></div>
  
  <script>
    // Connect to server
    const socket = io('http://localhost:3016');
    
    socket.on('connect', () => {
      console.log('✅ Connected:', socket.id);
      document.getElementById('messages').innerHTML += `<p>Connected: ${socket.id}</p>`;
      
      // Join task room
      const taskId = '673123abc456def789012345'; // Use your task ID
      socket.emit('join-task', taskId);
      console.log('📡 Joined task room:', taskId);
    });
    
    // Listen for worklog updates
    socket.on('worklog-updated', (data) => {
      console.log('📝 Worklog Updated:', data);
      document.getElementById('messages').innerHTML += 
        `<p><strong>Worklog Update:</strong> ${data.type} - Total: $${data.totalCost}</p>`;
    });
    
    // Listen for task updates
    socket.on('task-updated', (data) => {
      console.log('📋 Task Updated:', data);
      document.getElementById('messages').innerHTML += 
        `<p><strong>Task Update:</strong> ${data.type}</p>`;
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Disconnected');
    });
  </script>
</body>
</html>
```

**3. Test Real-Time Updates:**
- Open `test.html` in browser
- Keep browser console open
- Run Thunder Client tests (Test 6-8)
- Watch real-time events appear in console!

---

## 📊 Complete Test Checklist

### ✅ Phase 1: Setup
- [ ] Test 1: Health check passed
- [ ] Test 2: Services fetched from admin
- [ ] Test 3: Products fetched from admin

### ✅ Phase 2: Task Management
- [ ] Test 4: Tasks fetched from manager-service
- [ ] Test 12: Progress added to task
- [ ] Test 13: Task status updated

### ✅ Phase 3: Worklog (Core Feature)
- [ ] Test 5: Worklog created
- [ ] Test 6: Service added (cost = 500)
- [ ] Test 7: Product 1 added (cost = 750)
- [ ] Test 8: Product 2 added (cost = 1100)
- [ ] Test 9: Worklog details retrieved
- [ ] Test 10: Worklog completed (duration calculated)
- [ ] Test 11: All worklogs for task retrieved

### ✅ Phase 4: Error Handling
- [ ] Test 14: Insufficient stock error

### ✅ Phase 5: Appointments
- [ ] Test 15: Appointment created
- [ ] Test 16: Today's appointments
- [ ] Test 17: Upcoming appointments

### ✅ Phase 6: Real-Time
- [ ] WebSocket connection established
- [ ] Real-time events received for worklog updates
- [ ] Real-time events received for task updates

---

## 🎯 Key Validation Points

### Integration Validations:
✅ **Admin Service**: Services & products fetched correctly  
✅ **Manager Service**: Assigned tasks fetched  
✅ **Stock Management**: Stock deducted in MySQL  

### Functionality Validations:
✅ **Worklog Cost**: Auto-calculated (service + products)  
✅ **Duration**: Auto-calculated from start/end time  
✅ **Real-Time**: Socket.IO events emitted  
✅ **Error Handling**: Stock validation, not found errors  

### Data Validations:
✅ **Multiple Products**: Worklog supports multiple products  
✅ **Task Details**: Customer & vehicle info from manager-service  
✅ **Timestamps**: Proper ISO 8601 format  

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch services from admin service"
**Solution:**
- Check admin-service is running: `http://localhost:8000/admin`
- Verify MySQL has data in `admin_services_service` table
- Check CORS settings in admin-service

### Issue: "Empty array for tasks"
**Solution:**
- Verify manager-service is running on port 3002
- Check technician exists with assigned tasks in manager-service
- Use correct technicianId in query parameter

### Issue: "Insufficient stock" error
**Solution:**
- Check current stock: `GET http://localhost:3016/api/parts`
- Adjust `quantityUsed` to be less than available stock
- Or add more stock in admin-service

### Issue: Socket.IO not connecting
**Solution:**
- Check server.js has Socket.IO configured
- Verify port 3016 is accessible
- Check browser console for connection errors
- Try: `curl http://localhost:3016/socket.io/`

---

## 📦 Export Thunder Client Collection

To save this as a Thunder Client collection:

1. Create a new collection: "Technician Service Tests"
2. Add each test as a request in the collection
3. Use variables for:
   - `{{base_url}}` = `http://localhost:3016`
   - `{{task_id}}` = (from Test 4 response)
   - `{{worklog_id}}` = (from Test 5 response)

---

## 🚀 Quick Start Testing Script

```bash
# Terminal 1 - Start all services
cd services/admin-service && python manage.py runserver &
cd services/manager-service && npm start &
cd services/technician-service && npm start &

# Wait 5 seconds for services to start
sleep 5

# Run health check
curl http://localhost:3016/

# Test services endpoint
curl http://localhost:3016/api/services

# Test products endpoint
curl http://localhost:3016/api/parts

echo "✅ Setup complete! Now run Thunder Client tests."
```

---

**Happy Testing! 🎉**

For detailed functionality documentation, see: `FUNCTIONALITY_OVERVIEW.md`  
For Socket.IO integration, see: `REALTIME_UPDATES.md`
