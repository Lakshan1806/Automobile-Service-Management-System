# Real-Time Updates with Socket.IO

The technician-service now supports **real-time updates** using WebSockets (Socket.IO) for immediate progress tracking when technicians add services or products to worklogs.

## Features

✅ **Real-time worklog updates** - When a service is added to a worklog  
✅ **Real-time product tracking** - When a product/part is used  
✅ **Real-time task progress** - When progress notes are added  
✅ **Real-time status changes** - When task status is updated  

## Architecture

```
Technician Action (Frontend)
    ↓
REST API Call to technician-service
    ↓
Database Update
    ↓
Socket.IO Event Emitted
    ↓
Real-time Update to All Connected Clients
```

## Connection Details

**Server URL**: `http://localhost:3016`  
**Socket.IO Version**: Latest  
**CORS**: Enabled for all origins (configure for production)

## Frontend Integration

### 1. Install Socket.IO Client

```bash
npm install socket.io-client
```

### 2. Connect to Server

```javascript
import { io } from 'socket.io-client';

// Connect to technician-service
const socket = io('http://localhost:3016', {
  transports: ['websocket', 'polling']
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to technician-service:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from technician-service');
});
```

### 3. Join Task Room

To receive updates for a specific task, join its room:

```javascript
const taskId = '67890abcdef';

// Join the task room
socket.emit('join-task', taskId);

// Leave the task room when done
socket.emit('leave-task', taskId);
```

### 4. Listen for Real-Time Updates

#### Worklog Updates (Service/Product Added)

```javascript
socket.on('worklog-updated', (data) => {
  console.log('Worklog updated:', data);
  
  // data structure:
  // {
  //   type: 'service-added' | 'product-added',
  //   worklogId: '123',
  //   taskId: '456',
  //   service: { service_id, name, price },  // if type === 'service-added'
  //   product: { product_id, name, quantityUsed, unitPrice, totalPrice },  // if type === 'product-added'
  //   totalCost: 1500,
  //   timestamp: '2025-11-11T10:30:00.000Z'
  // }
  
  // Update UI with new service/product
  if (data.type === 'service-added') {
    updateServiceInUI(data.service, data.totalCost);
  } else if (data.type === 'product-added') {
    updateProductInUI(data.product, data.totalCost);
  }
});
```

#### Task Updates (Status/Progress)

```javascript
socket.on('task-updated', (data) => {
  console.log('Task updated:', data);
  
  // data structure:
  // {
  //   type: 'status-changed' | 'progress-added',
  //   taskId: '456',
  //   status: 'in-progress' | 'completed',  // if type === 'status-changed'
  //   progress: { _id, message, createdBy, timestamp },  // if type === 'progress-added'
  //   data: { ... },  // raw update data
  //   timestamp: '2025-11-11T10:30:00.000Z'
  // }
  
  // Update UI based on event type
  if (data.type === 'status-changed') {
    updateTaskStatus(data.taskId, data.status);
  } else if (data.type === 'progress-added') {
    addProgressNote(data.taskId, data.progress);
  }
});
```

## Complete React Example

```jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function TaskProgress({ taskId }) {
  const [socket, setSocket] = useState(null);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    // Connect to server
    const newSocket = io('http://localhost:3016');
    setSocket(newSocket);

    // Join task room
    newSocket.emit('join-task', taskId);

    // Listen for worklog updates
    newSocket.on('worklog-updated', (data) => {
      setUpdates(prev => [...prev, {
        time: new Date(data.timestamp),
        type: 'worklog',
        message: data.type === 'service-added' 
          ? `Service added: ${data.service.name} ($${data.service.price})`
          : `Product used: ${data.product.name} x${data.product.quantityUsed} ($${data.product.totalPrice})`,
        totalCost: data.totalCost
      }]);
    });

    // Listen for task updates
    newSocket.on('task-updated', (data) => {
      setUpdates(prev => [...prev, {
        time: new Date(data.timestamp),
        type: 'task',
        message: data.type === 'status-changed'
          ? `Status changed to: ${data.status}`
          : `Progress: ${data.progress.message}`
      }]);
    });

    // Cleanup
    return () => {
      newSocket.emit('leave-task', taskId);
      newSocket.close();
    };
  }, [taskId]);

  return (
    <div className="task-progress">
      <h3>Real-Time Updates</h3>
      <div className="updates-list">
        {updates.map((update, index) => (
          <div key={index} className="update-item">
            <span className="time">{update.time.toLocaleTimeString()}</span>
            <span className="message">{update.message}</span>
            {update.totalCost && (
              <span className="cost">Total: ${update.totalCost}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskProgress;
```

## Complete Next.js Example

```typescript
// hooks/useTaskSocket.ts
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WorklogUpdate {
  type: 'service-added' | 'product-added';
  worklogId: string;
  taskId: string;
  service?: { service_id: number; name: string; price: number };
  product?: { product_id: number; name: string; quantityUsed: number; unitPrice: number; totalPrice: number };
  totalCost: number;
  timestamp: string;
}

interface TaskUpdate {
  type: 'status-changed' | 'progress-added';
  taskId: string;
  status?: string;
  progress?: { _id: string; message: string; createdBy: string | null; timestamp: Date };
  timestamp: string;
}

export function useTaskSocket(taskId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [worklogUpdates, setWorklogUpdates] = useState<WorklogUpdate[]>([]);
  const [taskUpdates, setTaskUpdates] = useState<TaskUpdate[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3016');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected:', newSocket.id);
      newSocket.emit('join-task', taskId);
    });

    newSocket.on('worklog-updated', (data: WorklogUpdate) => {
      setWorklogUpdates(prev => [...prev, data]);
    });

    newSocket.on('task-updated', (data: TaskUpdate) => {
      setTaskUpdates(prev => [...prev, data]);
    });

    return () => {
      newSocket.emit('leave-task', taskId);
      newSocket.close();
    };
  }, [taskId]);

  return { socket, worklogUpdates, taskUpdates };
}
```

```tsx
// components/TaskProgress.tsx
'use client';

import { useTaskSocket } from '@/hooks/useTaskSocket';

export default function TaskProgress({ taskId }: { taskId: string }) {
  const { worklogUpdates, taskUpdates } = useTaskSocket(taskId);

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Real-Time Updates</h3>
      
      <div className="space-y-2">
        <div>
          <h4 className="font-semibold">Worklog Updates:</h4>
          {worklogUpdates.map((update, i) => (
            <div key={i} className="text-sm p-2 bg-blue-50 rounded">
              {update.type === 'service-added' && update.service && (
                <p>Service: {update.service.name} - ${update.service.price}</p>
              )}
              {update.type === 'product-added' && update.product && (
                <p>Product: {update.product.name} x{update.product.quantityUsed} - ${update.product.totalPrice}</p>
              )}
              <p className="text-xs text-gray-600">Total Cost: ${update.totalCost}</p>
            </div>
          ))}
        </div>
        
        <div>
          <h4 className="font-semibold">Task Updates:</h4>
          {taskUpdates.map((update, i) => (
            <div key={i} className="text-sm p-2 bg-green-50 rounded">
              {update.type === 'status-changed' && (
                <p>Status: {update.status}</p>
              )}
              {update.type === 'progress-added' && update.progress && (
                <p>Progress: {update.progress.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Event Types Reference

### `worklog-updated`

Emitted when a service or product is added to a worklog.

**Payload:**
```typescript
{
  type: 'service-added' | 'product-added',
  worklogId: string,
  taskId: string,
  service?: {
    service_id: number,
    name: string,
    price: number
  },
  product?: {
    product_id: number,
    name: string,
    quantityUsed: number,
    unitPrice: number,
    totalPrice: number
  },
  totalCost: number,
  timestamp: string
}
```

### `task-updated`

Emitted when task status changes or progress is added.

**Payload:**
```typescript
{
  type: 'status-changed' | 'progress-added',
  taskId: string,
  status?: string,
  progress?: {
    _id: string,
    message: string,
    createdBy: string | null,
    timestamp: Date
  },
  data?: any,
  timestamp: string
}
```

## Testing with Postman/Thunder Client

You can test the WebSocket connection using tools that support Socket.IO:

1. **Connect** to `ws://localhost:3016`
2. **Emit** `join-task` event with taskId: `"67890abcdef"`
3. **Make REST API calls** to add services/products
4. **Receive** real-time events

## Production Considerations

### CORS Configuration

Update the CORS origin in `server.js` for production:

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: ["https://yourdomain.com", "https://admin.yourdomain.com"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### Authentication

Add authentication to Socket.IO connections:

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  // Verify token...
  next();
});
```

### Room Management

The current implementation uses task-based rooms:
- Clients join: `task-${taskId}`
- Updates are broadcast to: `io.to('task-${taskId}').emit(...)`

This ensures only clients watching a specific task receive its updates.

## Summary

✅ **Real-time updates** implemented using Socket.IO  
✅ **Room-based broadcasting** for task-specific updates  
✅ **Event types**: worklog-updated, task-updated  
✅ **No notification database** needed  
✅ **Simple client integration** with React/Next.js  

The system now provides instant feedback when:
- Technicians add services to worklogs
- Technicians use products/parts
- Task status changes
- Progress notes are added
