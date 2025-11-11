# Quick Start Testing Guide - Thunder Client

## 🎯 5-Minute Quick Test

### Step 1: Health Check (30 seconds)
```
GET http://localhost:3016/
```
✅ Should return: `{ "ok": true, "message": "Technician Management API" }`

---

### Step 2: Verify Integrations (1 minute)

**Test Admin Service Integration:**
```
GET http://localhost:3016/api/services
```
✅ Should return list of services from MySQL

**Test Manager Service Integration:**
```
GET http://localhost:3016/api/tasks?technicianId=TECH001
```
✅ Should return assigned tasks
📝 **SAVE** a task `_id` for next steps

---

### Step 3: Complete Worklog Flow (3 minutes)

**3.1 Create Worklog**
```http
POST http://localhost:3016/api/worklogs
Content-Type: application/json

{
  "task": "YOUR_TASK_ID_HERE",
  "startTime": "2025-11-11T08:00:00Z",
  "notes": "Starting work"
}
```
📝 **SAVE** the returned worklog `_id`

---

**3.2 Add Service**
```http
POST http://localhost:3016/api/worklogs/YOUR_WORKLOG_ID/service
Content-Type: application/json

{
  "serviceId": 1
}
```
✅ Check: `totalCost` should show service price (e.g., 500)

---

**3.3 Add Product**
```http
POST http://localhost:3016/api/worklogs/YOUR_WORKLOG_ID/products
Content-Type: application/json

{
  "productId": 5,
  "quantityUsed": 2
}
```
✅ Check: 
- `totalCost` updated (e.g., 750)
- Product added to `productsUsed` array
- Stock deducted in admin-service

---

**3.4 Complete Worklog**
```http
PUT http://localhost:3016/api/worklogs/YOUR_WORKLOG_ID
Content-Type: application/json

{
  "endTime": "2025-11-11T10:30:00Z",
  "notes": "Work completed"
}
```
✅ Check: `duration` calculated (150 minutes)

---

## 📊 Visual Testing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

1️⃣  Health Check
    GET /
    └─> ✅ API is running

2️⃣  Integration Tests
    GET /api/services        (Admin Service)
    GET /api/parts          (Admin Service)
    GET /api/tasks?technicianId=TECH001  (Manager Service)
    └─> ✅ All services connected

3️⃣  Core Worklog Flow
    POST /api/worklogs
    └─> 📝 Save worklog_id
         │
         ├─> POST /worklogs/{id}/service
         │   └─> ✅ totalCost = 500
         │
         ├─> POST /worklogs/{id}/products
         │   └─> ✅ totalCost = 750 (stock -2)
         │
         └─> PUT /worklogs/{id}
             └─> ✅ duration = 150 min

4️⃣  Real-Time Testing
    Open browser → Connect Socket.IO → Join task room
    └─> Run worklog tests → See live updates!

5️⃣  Error Testing
    POST /worklogs/{id}/products (quantity > stock)
    └─> ✅ Error: Insufficient stock
```

---

## 🔥 Real-Time WebSocket Test (1 minute)

**Option 1: Browser Console**
```javascript
// Paste in browser console (http://localhost:3016)
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
document.head.appendChild(script);

setTimeout(() => {
  const socket = io('http://localhost:3016');
  socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);
    socket.emit('join-task', 'YOUR_TASK_ID');
    console.log('📡 Joined task room');
  });
  
  socket.on('worklog-updated', (data) => {
    console.log('🔥 REAL-TIME UPDATE:', data);
  });
}, 1000);
```

**Option 2: Node.js Script**
```javascript
// test-socket.js
const io = require('socket.io-client');
const socket = io('http://localhost:3016');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  socket.emit('join-task', 'YOUR_TASK_ID');
});

socket.on('worklog-updated', (data) => {
  console.log('🔥 Real-time update:', JSON.stringify(data, null, 2));
});

// Keep alive
setInterval(() => {}, 1000);
```

Run: `node test-socket.js`

---

## 🎯 Thunder Client Setup

### Method 1: Manual Setup

1. **Install Thunder Client** extension in VS Code
2. **Create New Collection**: "Technician Service"
3. **Add requests** from TESTING_GUIDE.md

### Method 2: Import Collection (Recommended)

1. Open Thunder Client in VS Code
2. Click **"Collections"** tab
3. Click **menu (...)** → **"Import"**
4. Select `thunder-client-collection.json`
5. ✅ All tests loaded!

---

## 📝 Variables Setup in Thunder Client

Create these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:3016` | Service base URL |
| `task_id` | `673123...` | Task ID from GET /tasks |
| `worklog_id` | `674aaa...` | Worklog ID from POST /worklogs |

**How to set:**
1. Thunder Client → **Env** tab
2. Create new environment: "Local"
3. Add variables above
4. Use in requests: `{{base_url}}/api/tasks`

---

## ✅ Expected Results Checklist

### Integration Tests
- [ ] Services fetched from admin (MySQL)
- [ ] Products fetched from admin (MySQL)
- [ ] Tasks fetched from manager (MongoDB)

### Worklog Tests
- [ ] Worklog created with startTime
- [ ] Service added → totalCost = 500
- [ ] Product 1 added → totalCost = 750
- [ ] Product 2 added → totalCost = 1100
- [ ] Duration auto-calculated (150 min)
- [ ] Stock deducted in MySQL (verify with GET /api/parts)

### Real-Time Tests
- [ ] Socket.IO connected
- [ ] Joined task room
- [ ] Received worklog-updated events
- [ ] Received task-updated events

### Error Tests
- [ ] Insufficient stock error works
- [ ] Invalid service ID error works

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| **Connection refused** | Check service is running: `npm start` |
| **Empty tasks array** | Verify technicianId exists in manager-service |
| **Services not found** | Check admin-service running on port 8000 |
| **Stock error** | Check current stock: `GET /api/parts` |
| **Socket.IO not connecting** | Verify server.js has Socket.IO configured |

---

## 🚀 Complete Testing Script (Copy-Paste)

```bash
#!/bin/bash

echo "🚀 Starting Technician Service Tests..."

# 1. Health Check
echo "\n1️⃣  Testing Health Check..."
curl -s http://localhost:3016/ | jq

# 2. Test Services Integration
echo "\n2️⃣  Testing Services Integration..."
curl -s http://localhost:3016/api/services | jq '.data | length'

# 3. Test Products Integration
echo "\n3️⃣  Testing Products Integration..."
curl -s http://localhost:3016/api/parts | jq '.data | length'

# 4. Test Tasks (replace TECH001 with your ID)
echo "\n4️⃣  Testing Tasks..."
TASKS=$(curl -s "http://localhost:3016/api/tasks?technicianId=TECH001")
echo $TASKS | jq '.data | length'

# Extract first task ID
TASK_ID=$(echo $TASKS | jq -r '.data[0]._id')
echo "Task ID: $TASK_ID"

# 5. Create Worklog
echo "\n5️⃣  Creating Worklog..."
WORKLOG=$(curl -s -X POST http://localhost:3016/api/worklogs \
  -H "Content-Type: application/json" \
  -d "{\"task\":\"$TASK_ID\",\"startTime\":\"2025-11-11T08:00:00Z\",\"notes\":\"Test\"}")
WORKLOG_ID=$(echo $WORKLOG | jq -r '.data._id')
echo "Worklog ID: $WORKLOG_ID"

# 6. Add Service
echo "\n6️⃣  Adding Service..."
curl -s -X POST http://localhost:3016/api/worklogs/$WORKLOG_ID/service \
  -H "Content-Type: application/json" \
  -d '{"serviceId":1}' | jq '.data.totalCost'

# 7. Add Product
echo "\n7️⃣  Adding Product..."
curl -s -X POST http://localhost:3016/api/worklogs/$WORKLOG_ID/products \
  -H "Content-Type: application/json" \
  -d '{"productId":5,"quantityUsed":2}' | jq '.data.totalCost'

echo "\n✅ Tests Complete!"
```

Save as `test.sh`, make executable: `chmod +x test.sh`, run: `./test.sh`

---

## 📖 Full Documentation

- **Complete Testing Guide**: `TESTING_GUIDE.md`
- **Functionality Overview**: `FUNCTIONALITY_OVERVIEW.md`
- **Real-Time Updates**: `REALTIME_UPDATES.md`

**Happy Testing! 🎉**
