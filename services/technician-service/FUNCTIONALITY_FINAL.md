# Technician Service - Complete Functionality & Flow

## 📋 Overview

The **Technician Service** is a Node.js/Express microservice that manages technician operations, task execution, worklog tracking, and real-time progress updates for an automobile service management system.

**Tech Stack:**
- Node.js + Express
- MongoDB (local data storage)
- Socket.IO (real-time updates)
- Axios (inter-service communication)

**Port:** 3016

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TECHNICIAN SERVICE                        │
│                      (Port 3016)                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Socket.IO  │  │  REST API    │  │   MongoDB    │     │
│  │  (WebSocket) │  │  (Express)   │  │   (Local)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
           ↓                    ↓                    ↓
    Real-time           HTTP Requests         Data Storage
     Updates              ↙        ↘
                         ↙          ↘
         ┌──────────────────┐  ┌──────────────────┐
         │  ADMIN SERVICE   │  │ MANAGER SERVICE  │
         │   (Port 8000)    │  │   (Port 3002)    │
         │  Django + MySQL  │  │  Node + MongoDB  │
         └──────────────────┘  └──────────────────┘
              Services &            Assigned
              Products              Tasks
```

---

## 🎯 Core Functionalities

### 1. **Task Management** (From Manager Service)
Tasks are assigned appointments fetched from manager-service.

#### Endpoints:
- `GET /api/tasks?technicianId={id}` - Fetch assigned tasks for a technician
- `GET /api/tasks/:id` - Get specific task details
- `PUT /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/progress` - Add progress note
- `POST /api/tasks/:id/parts` - Add parts to task (deprecated, use worklog)
- `POST /api/tasks` - Create task (⚠️ DEPRECATED)

#### Flow:
```
1. Manager assigns appointment to technician
       ↓
2. Technician requests: GET /api/tasks?technicianId=TECH001
       ↓
3. Service fetches from manager-service:
   - Assigned tasks for technician
   - Appointment details for each task
       ↓
4. Returns transformed task data with customer & vehicle info
```

**Key Features:**
- ✅ Tasks fetched from manager-service (not created locally)
- ✅ Includes customer & vehicle information
- ✅ Real-time status updates via Socket.IO
- ✅ Progress tracking with notes

---

### 2. **Worklog Management** (Core Feature)
Worklogs track time spent, services performed, and products used per task.

#### Endpoints:
- `POST /api/worklogs` - Create new worklog
- `GET /api/worklogs/task/:taskId` - Get all worklogs for a task
- `GET /api/worklogs/:id` - Get specific worklog
- `PUT /api/worklogs/:id` - Update worklog
- `POST /api/worklogs/:id/service` - Add service to worklog
- `POST /api/worklogs/:id/products` - Add product/part to worklog

#### Flow: Add Service to Worklog
```
1. Technician starts work on task → Create worklog
       ↓
2. Technician selects service: POST /api/worklogs/{worklogId}/service
   Body: { serviceId: 1 }
       ↓
3. Service fetches service details from admin-service (MySQL)
       ↓
4. Adds service to worklog with price
       ↓
5. Calculates totalCost (service price + products)
       ↓
6. Emits Socket.IO event: 'worklog-updated'
   { type: 'service-added', service: {...}, totalCost: 500 }
       ↓
7. Frontend receives real-time update instantly
```

#### Flow: Add Product to Worklog
```
1. Technician uses product: POST /api/worklogs/{worklogId}/products
   Body: { productId: 5, quantityUsed: 2 }
       ↓
2. Service fetches product details from admin-service
       ↓
3. Checks stock availability in MySQL
       ↓
4. If sufficient stock:
   - Adds product to worklog with calculated cost
   - Updates stock in admin-service (MySQL)
   - Calculates new totalCost
       ↓
5. Emits Socket.IO event: 'worklog-updated'
   { type: 'product-added', product: {...}, totalCost: 750 }
       ↓
6. Frontend receives real-time update + new total cost
```

**Key Features:**
- ✅ Auto-calculates work duration (startTime → endTime)
- ✅ Auto-calculates total cost (service + all products)
- ✅ Real-time updates via WebSocket
- ✅ Stock deduction in admin-service
- ✅ Supports multiple products per worklog

**Worklog Structure:**
```javascript
{
  _id: "abc123",
  task: "taskId",
  startTime: "2025-11-11T08:00:00Z",
  endTime: "2025-11-11T10:30:00Z",
  duration: 150, // minutes (auto-calculated)
  notes: "Oil change completed",
  service: {
    service_id: 1,
    name: "Oil Change",
    price: 500
  },
  productsUsed: [
    {
      product_id: 5,
      name: "Engine Oil 5W-30",
      quantityUsed: 2,
      unitPrice: 125,
      totalPrice: 250
    }
  ],
  totalCost: 750 // auto-calculated
}
```

---

### 3. **Services Integration** (From Admin Service)
Fetches available automobile services from admin-service.

#### Endpoints:
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get specific service
- `POST /api/services` - Create service (⚠️ Deprecated - use admin-service)
- `PUT /api/services/:id` - Update service (⚠️ Deprecated)
- `DELETE /api/services/:id` - Delete service (⚠️ Deprecated)

#### Flow:
```
1. Frontend requests: GET /api/services
       ↓
2. Service calls admin-service: GET /api/public/services/
       ↓
3. Fetches services from MySQL database
       ↓
4. Returns: [
     { service_id: 1, name: "Oil Change", price: 500, category: "maintenance" },
     { service_id: 2, name: "Brake Repair", price: 1200, category: "repair" }
   ]
```

**Service Categories:**
- `maintenance` - Regular maintenance
- `repair` - Repair work
- `inspection` - Vehicle inspection
- `diagnostic` - Diagnostics
- `other` - Other services

---

### 4. **Parts/Products Integration** (From Admin Service)
Fetches available parts/products from admin-service with stock tracking.

#### Endpoints:
- `GET /api/parts` - List all parts
- `GET /api/parts/:id` - Get specific part
- `POST /api/parts` - Create part (⚠️ Deprecated - use admin-service)
- `PUT /api/parts/:id` - Update part (⚠️ Deprecated)
- `DELETE /api/parts/:id` - Delete part (⚠️ Deprecated)
- `POST /api/parts/task/:taskId` - Add part to task (⚠️ Deprecated - use worklog)
- `GET /api/parts/task/:taskId` - Get parts for task
- `DELETE /api/parts/task-part/:id` - Remove part from task

#### Flow:
```
1. Frontend requests: GET /api/parts
       ↓
2. Service calls admin-service: GET /api/public/products/
       ↓
3. Fetches products from MySQL with stock info
       ↓
4. Returns: [
     { product_id: 5, name: "Engine Oil 5W-30", price: 125, stock: 50 },
     { product_id: 6, name: "Brake Pads", price: 350, stock: 20 }
   ]
```

**Stock Management:**
- Stock checked before adding to worklog
- Stock automatically deducted in MySQL
- Error if insufficient stock

---

### 5. **Appointments Management** (Local MongoDB)
Local appointment tracking for technicians.

#### Endpoints:
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List all appointments
- `GET /api/appointments/upcoming` - Get upcoming appointments
- `GET /api/appointments/today` - Get today's appointments
- `GET /api/appointments/date/:date` - Get appointments by date
- `GET /api/appointments/:id` - Get specific appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

**Appointment Structure:**
```javascript
{
  _id: "xyz789",
  customer: {
    name: "John Doe",
    phone: "+1234567890",
    email: "john@example.com"
  },
  vehicle: {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    vin: "ABC123XYZ",
    licensePlate: "XYZ-1234"
  },
  appointmentDate: "2025-11-15",
  appointmentTime: "10:00 AM",
  serviceType: "Oil Change",
  status: "scheduled" // scheduled | confirmed | in-progress | completed | cancelled
}
```

---

### 6. **Real-Time Updates** (Socket.IO)
WebSocket-based real-time progress tracking.

#### Socket Events:

**Client → Server:**
- `join-task` - Join a task room to receive updates
- `leave-task` - Leave a task room
- `disconnect` - Client disconnected

**Server → Client:**
- `worklog-updated` - Service or product added to worklog
- `task-updated` - Task status or progress changed

#### Real-Time Flow:
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │  Technician  │         │   Manager    │
│              │         │   Service    │         │   Dashboard  │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ socket.connect()       │                        │
       │───────────────────────>│                        │
       │                        │                        │
       │ emit('join-task', id)  │                        │
       │───────────────────────>│                        │
       │                        │                        │
       │ POST /worklogs/x/service                       │
       │───────────────────────>│                        │
       │                        │ Update DB              │
       │                        │ Emit to room           │
       │<───────────────────────│───────────────────────>│
       │ 'worklog-updated'      │      'worklog-updated' │
       │ {service: "Oil Change",│      {realtime update} │
       │  totalCost: 500}       │                        │
```

**Event Payloads:**

`worklog-updated` event:
```javascript
{
  type: 'service-added' | 'product-added',
  worklogId: '123',
  taskId: '456',
  service: { service_id: 1, name: 'Oil Change', price: 500 },
  product: { product_id: 5, name: 'Engine Oil', quantityUsed: 2, totalPrice: 250 },
  totalCost: 750,
  timestamp: '2025-11-11T10:30:00Z'
}
```

`task-updated` event:
```javascript
{
  type: 'status-changed' | 'progress-added',
  taskId: '456',
  status: 'in-progress',
  progress: { _id: 'p1', message: 'Started work', timestamp: '...' },
  timestamp: '2025-11-11T10:30:00Z'
}
```

---

## 🔄 Complete User Journey

### Scenario: Technician performs an oil change

```
┌─────────────────────────────────────────────────────────────┐
│ 1. TASK ASSIGNMENT (Manager Service)                        │
└─────────────────────────────────────────────────────────────┘
Manager assigns appointment to TECH001
   → Stored in manager-service MongoDB

┌─────────────────────────────────────────────────────────────┐
│ 2. TECHNICIAN VIEWS TASKS                                    │
└─────────────────────────────────────────────────────────────┘
GET /api/tasks?technicianId=TECH001
   → Fetches from manager-service
   → Returns: [{
       _id: 't123',
       title: 'Oil Change - Toyota Camry',
       customer: { name: 'John Doe', phone: '...' },
       vehicle: { make: 'Toyota', model: 'Camry' },
       status: 'assigned'
     }]

┌─────────────────────────────────────────────────────────────┐
│ 3. FRONTEND CONNECTS TO SOCKET.IO                           │
└─────────────────────────────────────────────────────────────┘
socket.connect('http://localhost:3016')
socket.emit('join-task', 't123')

┌─────────────────────────────────────────────────────────────┐
│ 4. TECHNICIAN STARTS WORK                                    │
└─────────────────────────────────────────────────────────────┘
POST /api/worklogs
Body: {
  task: 't123',
  startTime: '2025-11-11T08:00:00Z',
  notes: 'Starting oil change'
}
   → Creates worklog in MongoDB
   → Returns: { _id: 'w456', ... }

┌─────────────────────────────────────────────────────────────┐
│ 5. TECHNICIAN SELECTS SERVICE                                │
└─────────────────────────────────────────────────────────────┘
POST /api/worklogs/w456/service
Body: { serviceId: 1 }
   ↓
Fetches service from admin-service (MySQL)
   ↓
Adds to worklog: { service_id: 1, name: 'Oil Change', price: 500 }
   ↓
Emits: socket.to('task-t123').emit('worklog-updated', {
  type: 'service-added',
  service: { ... },
  totalCost: 500
})
   ↓
Frontend receives real-time update → Shows "Oil Change - $500"

┌─────────────────────────────────────────────────────────────┐
│ 6. TECHNICIAN USES PRODUCTS                                  │
└─────────────────────────────────────────────────────────────┘
POST /api/worklogs/w456/products
Body: { productId: 5, quantityUsed: 2 }
   ↓
Fetches product from admin-service (MySQL)
   → { product_id: 5, name: 'Engine Oil 5W-30', price: 125, stock: 50 }
   ↓
Checks stock: 50 >= 2 ✓
   ↓
Adds to worklog: {
  product_id: 5,
  name: 'Engine Oil 5W-30',
  quantityUsed: 2,
  unitPrice: 125,
  totalPrice: 250
}
   ↓
Updates stock in admin-service: 50 - 2 = 48
   ↓
Recalculates totalCost: 500 + 250 = 750
   ↓
Emits: socket.to('task-t123').emit('worklog-updated', {
  type: 'product-added',
  product: { ... },
  totalCost: 750
})
   ↓
Frontend receives real-time update → Shows "Engine Oil x2 - $250 | Total: $750"

┌─────────────────────────────────────────────────────────────┐
│ 7. TECHNICIAN ADDS PROGRESS NOTE                             │
└─────────────────────────────────────────────────────────────┘
POST /api/tasks/t123/progress
Body: { message: 'Oil drained, filter replaced' }
   ↓
Creates progress note in MongoDB
   ↓
Emits: socket.to('task-t123').emit('task-updated', {
  type: 'progress-added',
  progress: { message: '...' }
})
   ↓
Manager dashboard receives real-time update

┌─────────────────────────────────────────────────────────────┐
│ 8. TECHNICIAN COMPLETES WORK                                 │
└─────────────────────────────────────────────────────────────┘
PUT /api/worklogs/w456
Body: {
  endTime: '2025-11-11T10:30:00Z',
  notes: 'Oil change completed successfully'
}
   ↓
Calculates duration: 150 minutes
   ↓
Updates worklog in MongoDB
   ↓
PUT /api/tasks/t123
Body: { status: 'completed' }
   ↓
Emits: socket.to('task-t123').emit('task-updated', {
  type: 'status-changed',
  status: 'completed'
})
   ↓
Manager dashboard shows task completed in real-time
```

---

## 📊 Data Models

### Task Model (MongoDB)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: String, // assigned | in-progress | completed | cancelled
  technicianId: String,
  parts: [{
    product_id: Number,
    name: String,
    quantityUsed: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalCost: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Worklog Model (MongoDB)
```javascript
{
  _id: ObjectId,
  task: ObjectId, // Reference to Task
  startTime: Date,
  endTime: Date,
  duration: Number, // minutes (auto-calculated)
  notes: String,
  service: {
    service_id: Number,
    name: String,
    price: Number
  },
  productsUsed: [{
    product_id: Number,
    name: String,
    quantityUsed: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalCost: Number, // auto-calculated
  createdAt: Date,
  updatedAt: Date
}
```

### Progress Model (MongoDB)
```javascript
{
  _id: ObjectId,
  task: ObjectId, // Reference to Task
  message: String,
  createdBy: String, // technicianId
  timestamp: Date
}
```

---

## 🔗 Inter-Service Communication

### With Admin Service (Django/MySQL - Port 8000)
**Purpose:** Fetch services and products, update stock

**Endpoints Used:**
- `GET /api/public/services/` - List services
- `GET /api/public/services/:id/` - Get service details
- `GET /api/public/products/` - List products
- `GET /api/public/products/:id/` - Get product details
- `PATCH /api/public/products/:id/stock/` - Update product stock

**Authentication:** Public endpoints (no auth required)

### With Manager Service (Node/MongoDB - Port 3002)
**Purpose:** Fetch assigned tasks/appointments

**Endpoints Used:**
- `GET /api/technicians` - List all technicians with assigned tasks
- `GET /api/appointments` - List all appointments

**Flow:** Fetch technicians → Filter by technicianId → Get assignedTasks → Fetch appointment details

---

## 🔐 Security & Middleware

### Authentication Middleware
- Extracts user info from requests
- Attaches to `req.user`
- Currently allows requests without authentication (for development)

### Validation Middleware
- Uses `express-validator`
- Validates request body/params
- Returns 400 error with validation messages

### Error Handler Middleware
- Catches all errors
- Logs errors
- Returns formatted JSON error responses

### Logger Middleware
- Logs all incoming requests
- Uses Winston logger
- Includes timestamp, method, URL, status

### CORS
- Enabled for all origins (development)
- Configure for production with specific origins

---

## 🚀 Key Features Summary

✅ **Task Management** - Fetches assigned tasks from manager-service  
✅ **Worklog Tracking** - Time, service, products, auto-calculated costs  
✅ **Real-Time Updates** - Socket.IO for instant progress updates  
✅ **Service Integration** - Fetches services from admin-service (MySQL)  
✅ **Product Integration** - Fetches products with stock management  
✅ **Stock Deduction** - Auto-updates stock in admin-service  
✅ **Cost Calculation** - Auto-calculates worklog total cost  
✅ **Progress Notes** - Add timestamped progress updates  
✅ **Appointment Management** - Local appointment tracking  
✅ **Multi-Service Architecture** - Communicates with 2+ services  

---

## 📁 Project Structure

```
technician-service/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── dotenv.js            # Environment variables
│   ├── controllers/             # Request handlers
│   │   ├── task.controller.js
│   │   ├── worklog.controller.js
│   │   ├── service.controller.js
│   │   ├── part.controller.js
│   │   └── appointment.controller.js
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   └── logger.middleware.js
│   ├── models/                  # MongoDB schemas
│   │   ├── task.model.js
│   │   ├── worklog.model.js
│   │   ├── progress.model.js
│   │   ├── service.model.js
│   │   ├── part.model.js
│   │   └── appointment.model.js
│   ├── routes/                  # API routes
│   │   ├── index.js
│   │   ├── task.routes.js
│   │   ├── worklog.routes.js
│   │   ├── service.routes.js
│   │   ├── part.routes.js
│   │   └── appointment.routes.js
│   ├── services/                # Business logic
│   │   ├── task.service.js
│   │   ├── worklog.service.js
│   │   ├── service.service.js
│   │   ├── part.service.js
│   │   └── appointment.service.js
│   ├── utils/                   # Utilities
│   │   ├── admin-api.js         # Admin service client
│   │   ├── manager-api.js       # Manager service client
│   │   ├── logger.js            # Winston logger
│   │   └── response.js          # Response helpers
│   └── server.js                # Express app + Socket.IO
├── package.json
├── REALTIME_UPDATES.md          # Socket.IO documentation
└── FUNCTIONALITY_OVERVIEW.md    # This file
```

---

## 🎯 Development Guidelines

### Adding New Features
1. Create model in `src/models/`
2. Create service in `src/services/`
3. Create controller in `src/controllers/`
4. Create routes in `src/routes/`
5. Register routes in `src/routes/index.js`
6. Add real-time events if needed (Socket.IO)

### Testing Workflow
1. Start admin-service (port 8000)
2. Start manager-service (port 3002)
3. Start technician-service (port 3016)
4. Test with Postman/Thunder Client
5. Connect Socket.IO client for real-time testing

### Environment Variables
```env
PORT=3016
MONGODB_URI=mongodb://localhost:27017/technician_service
ADMIN_SERVICE_URL=http://localhost:8000/api
MANAGER_SERVICE_URL=http://localhost:3002/api
```

---

## 📖 Related Documentation

- **REALTIME_UPDATES.md** - Complete Socket.IO integration guide
- **README.md** - Setup and installation instructions

---

**Last Updated:** November 11, 2025  
**Version:** 2.0  
**Maintainer:** Development Team
