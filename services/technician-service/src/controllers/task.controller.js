import * as TaskService from "../services/task.service.js";
import { success, error } from "../utils/response.js";

export const createTaskHandler = async (req, res) => {
  try {
    const payload = req.body;
    const task = await TaskService.createTask(payload);
    return success(res, task, "Task created", 201);
  } catch (err) {
    return error(res, "Failed to create task", 500, err.message);
  }
};

export const listTasksHandler = async (req, res) => {
  try {
    const tasks = await TaskService.getTasks();
    return success(res, tasks, "Tasks fetched");
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
    const updated = await TaskService.updateTask(id, req.body);
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
    const progress = await TaskService.addProgress(
      id,
      message,
      req.user?.id || null
    );
    return success(res, progress, "Progress added", 201);
  } catch (err) {
    return error(res, "Failed to add progress", 500, err.message);
  }
};
