import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import appointmentRoutes from './routes/appointmentRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';
import roadAssistRoutes from './routes/roadAssistRoutes.js';
import { syncAppointments } from './controllers/appointmentController.js';
import { syncTechnicians } from './controllers/technicianController.js';
import { syncRoadAssistData } from './services/roadAssistService.js';

// Get current directory

// Load environment variables from the manager-service directory
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);

// Load and parse the .env file manually
import fs from 'fs';
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

// Debug: Log environment variables
console.log('Environment Variables:');
console.log('MONGO_URI:', process.env.MONGO_URI ? '*** set ***' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'using default (3002)');

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined.');
  console.log('Please make sure you have a .env file with MONGO_URI in the project root.');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/roadassists', roadAssistRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Manager service is running' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3002;

console.log('Connecting to MongoDB...');
console.log('Connection String:', process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');

    // Sync data from external services
    try {
      console.log('Starting initial data sync...');
      
      // Sync appointments and technicians in parallel
      const [appointmentSync, technicianSync] = await Promise.all([
        syncAppointments(),
        syncTechnicians()
      ]);

      // Sync road assist data separately
      console.log('\n--- Syncing Road Assist Data ---');
      const roadAssistSync = await syncRoadAssistData();

      console.log('\n--- Initial Sync Results ---');
      console.log('Appointments:', appointmentSync.message);
      console.log('Technicians:', technicianSync.message);
      
      // Log road assist sync result
      if (roadAssistSync.success) {
        console.log('Road Assist:', roadAssistSync.message);
      } else {
        console.error('Road Assist Sync Failed:', roadAssistSync.message);
        if (roadAssistSync.error) {
          console.error('Error details:', roadAssistSync.error);
        }
      }
      
      if (appointmentSync.failedCount > 0) console.log('Appointment sync warnings:', appointmentSync.errors);
      if (technicianSync.failedCount > 0) console.log('Technician sync warnings:', technicianSync.errors);
      console.log('--- End Sync Results ---\n');
    } catch (error) {
      console.error('Error during initial sync:', error.message);
    }

    // Start the Express server after initial sync
    const server = app.listen(PORT, () => {
      console.log(`\n Manager service started at http://localhost:${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/health`);
      console.log(` Manager API: http://localhost:${PORT}/api`);
      console.log('\nAvailable Endpoints:');
      console.log(`- GET  /api/appointments         - Get all appointments`);
      console.log(`- GET  /api/appointments/sync    - Manually sync appointments`);
      console.log(`- GET  /api/technicians         - Get all technicians`);
      console.log(`- GET  /api/technicians/sync    - Manually sync technicians\n`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') throw error;

      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

