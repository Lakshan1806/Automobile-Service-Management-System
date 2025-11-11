import * as TaskService from "../services/task.service.js";
import { success, error } from "../utils/response.js";

export const createTaskHandler = async (req, res) => {
  try {
    console.warn('⚠️  Task creation endpoint is deprecated. Use manager-service to assign tasks.');
    const payload = req.body;
    const task = await TaskService.createTask(payload);
    return success(res, task, "Task created (DEPRECATED - use manager-service)", 201);
  } catch (err) {
    return error(res, "Failed to create task", 500, err.message);
  }
};

export const listTasksHandler = async (req, res) => {
  try {
    const { technicianId } = req.query;
    
    if (!technicianId) {
      return error(res, "technicianId query parameter is required", 400);
    }
    
    // Fetch tasks from manager service for this technician
    const tasks = await TaskService.getTasksForTechnician(technicianId);
    return success(res, tasks, `Fetched ${tasks.length} assigned tasks from manager-service`);
  } catch (err) {
    return error(res, "Failed to fetch tasks", 500, err.message);
  }
};

export const getTaskHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await TaskService.getTaskById(id);
    if (!task) return error(res, "Task not found", 404);
    return success(res, task, "Task fetched");
  } catch (err) {
    return error(res, "Failed to fetch task", 500, err.message);
  }
};

export const updateTaskHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get('io');
    const updated = await TaskService.updateTask(id, req.body, io);
    return success(res, updated, "Task updated");
  } catch (err) {
    return error(res, "Failed to update task", 500, err.message);
  }
};

export const deleteTaskHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await TaskService.deleteTask(id);
    return success(res, null, "Task deleted", 204);
  } catch (err) {
    return error(res, "Failed to delete task", 500, err.message);
  }
};

export const addProgressHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const io = req.app.get('io');
    const progress = await TaskService.addProgress(
      id,
      message,
      req.user?.id || null,
      io
    );
    return success(res, progress, "Progress added", 201);
  } catch (err) {
    return error(res, "Failed to add progress", 500, err.message);
  }
};

export const addPartToTaskHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { partId, quantityUsed } = req.body;
    
    if (!partId || !quantityUsed) {
      return error(res, "partId and quantityUsed are required", 400);
    }
    
    const task = await TaskService.addPartToTask(id, partId, quantityUsed);
    return success(res, task, "Part added to task successfully", 200);
  } catch (err) {
    return error(res, err.message || "Failed to add part to task", 500, err.message);
  }
};
