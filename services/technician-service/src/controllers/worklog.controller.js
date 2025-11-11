import * as WorklogService from "../services/worklog.service.js";
import { success, error } from "../utils/response.js";

export const createWorklogHandler = async (req, res) => {
  try {
    const worklog = await WorklogService.createWorklog(req.body);
    return success(res, worklog, "Worklog created", 201);
  } catch (err) {
    return error(res, "Failed to create worklog", 500, err.message);
  }
};

export const getWorklogsForTaskHandler = async (req, res) => {
  try {
    const { taskId } = req.params;
    const logs = await WorklogService.getWorklogsForTask(taskId);
    return success(res, logs, "Worklogs fetched");
  } catch (err) {
    return error(res, "Failed to get worklogs", 500, err.message);
  }
};

export const updateWorklogHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const worklog = await WorklogService.updateWorklog(id, req.body);
    if (!worklog) return error(res, "Worklog not found", 404);
    return success(res, worklog, "Worklog updated");
  } catch (err) {
    return error(res, "Failed to update worklog", 500, err.message);
  }
};

export const getWorklogHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const worklog = await WorklogService.getWorklogById(id);
    if (!worklog) return error(res, "Worklog not found", 404);
    return success(res, worklog, "Worklog fetched");
  } catch (err) {
    return error(res, "Failed to get worklog", 500, err.message);
  }
};

export const addServiceToWorklogHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceId } = req.body;
    
    if (!serviceId) {
      return error(res, "serviceId is required", 400);
    }
    
    const io = req.app.get('io');
    const worklog = await WorklogService.addServiceToWorklog(id, serviceId, io);
    return success(res, worklog, "Service added to worklog", 200);
  } catch (err) {
    return error(res, err.message || "Failed to add service to worklog", 500, err.message);
  }
};

export const addProductToWorklogHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantityUsed } = req.body;
    
    if (!productId || !quantityUsed) {
      return error(res, "productId and quantityUsed are required", 400);
    }
    
    const io = req.app.get('io');
    const worklog = await WorklogService.addProductToWorklog(id, productId, quantityUsed, io);
    return success(res, worklog, "Product added to worklog successfully", 200);
  } catch (err) {
    return error(res, err.message || "Failed to add product to worklog", 500, err.message);
  }
};
