import Task from "../models/task.model.js";
import Progress from "../models/progress.model.js";
import { fetchProductByIdFromAdmin, updateProductStockInAdmin } from "../utils/admin-api.js";
import { fetchAssignedTasksFromManager, fetchAppointmentByIdFromManager } from "../utils/manager-api.js";

/**
 * Get tasks for a specific technician from manager service
 * Tasks are actually assigned appointments from manager-service
 * @param {string} technicianId - The technician ID
 * @returns {Promise<Array>} - Array of tasks (appointments)
 */
export const getTasksForTechnician = async (technicianId) => {
  try {
    // Fetch assigned tasks from manager service
    const assignedTasks = await fetchAssignedTasksFromManager(technicianId);
    
    if (!assignedTasks || assignedTasks.length === 0) {
      return [];
    }
    
    // Fetch full appointment details for each task
    const tasksWithDetails = await Promise.all(
      assignedTasks.map(async (task) => {
        try {
          if (!task.appointmentId) return null;
          
          // Fetch appointment details from manager service
          const appointment = await fetchAppointmentByIdFromManager(task.appointmentId);
          
          if (!appointment) return null;
          
          // Transform to technician-service task format
          return {
            _id: task._id,
            appointmentId: task.appointmentId,
            customId: appointment.customId,
            title: `${appointment.serviceType} - ${appointment.vehicle?.make} ${appointment.vehicle?.model}`,
            description: appointment.description,
            customer: appointment.customer,
            vehicle: appointment.vehicle,
            serviceType: appointment.serviceType,
            status: task.status,
            startDate: task.startDate,
            workDuration: task.workDuration,
            suggested_started_date: appointment.suggested_started_date,
            predicted_duration_date: appointment.predicted_duration_date,
            appointmentStatus: appointment.status,
            source: 'manager_service'
          };
        } catch (error) {
          console.error(`Error fetching appointment details for task ${task._id}:`, error.message);
          return null;
        }
      })
    );
    
    // Filter out null values (failed fetches)
    return tasksWithDetails.filter(task => task !== null);
  } catch (error) {
    console.error('Error fetching tasks from manager service:', error.message);
    // Fallback: return empty array instead of throwing
    return [];
  }
};

export const createTask = async (taskData) => {
  console.warn('⚠️  WARNING: Task creation is deprecated. Tasks are now managed by manager-service.');
  console.warn('   Tasks are automatically assigned to technicians through manager-service appointments.');
  
  const task = await Task.create(taskData);
  return task;
};

export const getTasks = async (filter = {}, options = {}) => {
  const { limit = 50, skip = 0 } = options;
  return Task.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
};

export const getTaskById = async (id) => {
  return Task.findById(id);
};

export const updateTask = async (id, data, io) => {
  const task = await Task.findByIdAndUpdate(id, data, { new: true });
  
  // Emit real-time update
  if (io && task) {
    io.to(`task-${id}`).emit('task-updated', {
      type: 'status-changed',
      taskId: task._id,
      status: task.status,
      data: data,
      timestamp: new Date()
    });
  }
  
  return task;
};

export const deleteTask = async (id) => {
  return Task.findByIdAndDelete(id);
};

export const addProgress = async (taskId, message, createdBy = null, io) => {
  const progress = await Progress.create({ task: taskId, message, createdBy });
  
  // Emit real-time update
  if (io) {
    io.to(`task-${taskId}`).emit('task-updated', {
      type: 'progress-added',
      taskId,
      progress: {
        _id: progress._id,
        message: progress.message,
        createdBy: progress.createdBy,
        timestamp: progress.timestamp
      },
      timestamp: new Date()
    });
  }
  
  return progress;
};

/**
 * Add a part to a task and update stock in admin service
 */
export const addPartToTask = async (taskId, partId, quantityUsed) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  // Fetch part details from admin service
  const product = await fetchProductByIdFromAdmin(partId);
  if (!product) {
    throw new Error('Product not found in admin service');
  }

  // Check if enough stock available
  if (product.stock < quantityUsed) {
    throw new Error(`Insufficient stock. Available: ${product.stock}, Required: ${quantityUsed}`);
  }

  // Calculate costs
  const unitPrice = product.price;
  const totalPrice = unitPrice * quantityUsed;

  // Add part to task
  const partEntry = {
    product_id: product.product_id,
    name: product.name,
    quantityUsed,
    unitPrice,
    totalPrice
  };

  // Check if part already exists in task
  const existingPartIndex = task.parts.findIndex(p => p.product_id === partId);
  if (existingPartIndex >= 0) {
    // Update existing part
    task.parts[existingPartIndex].quantityUsed += quantityUsed;
    task.parts[existingPartIndex].totalPrice += totalPrice;
  } else {
    // Add new part
    task.parts.push(partEntry);
  }

  // Update total cost
  const partsTotal = task.parts.reduce((sum, p) => sum + p.totalPrice, 0);
  task.totalCost = (task.servicePrice || 0) + partsTotal;

  // Update stock in admin service
  const newStock = product.stock - quantityUsed;
  await updateProductStockInAdmin(partId, newStock);

  // Save task
  await task.save();

  return task;
};
