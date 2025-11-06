/*import express from 'express';
import cors from 'cors';
import managerRoutes from './routes/managerRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/manager', managerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Manager service is running',
    service: 'manager-service',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Automobile Service Manager API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      manager: '/api/manager'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist on this server`
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Manager Service Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default app;
*/

import express from 'express';
import managerRoutes from './routes/appoinmentRoutes.js'; // note the .js extension

const app = express();

app.use(express.json());
app.use('/api', managerRoutes);

export default app;
