import * as PartService from "../services/part.service.js";
import { success, error } from "../utils/response.js";


export const createPartHandler = async (req, res) => {
  try {
    const part = await PartService.createPart(req.body);
    return success(res, part, "Part created", 201);
  } catch (err) {
    return error(res, "Failed to create part", 500, err.message);
  }
};

export const listPartsHandler = async (req, res) => {
  try {
    const { active, lowStock } = req.query;
    let parts;
    if (lowStock === "true") {
      parts = await PartService.getLowStockParts();
    } else if (active === "true") {
      parts = await PartService.getActiveParts();
    } else {
      parts = await PartService.getParts();
    }
    return success(res, parts, "Parts fetched");
  } catch (err) {
    return error(res, "Failed to fetch parts", 500, err.message);
  }
};

export const getPartHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const part = await PartService.getPartById(id);
    if (!part) return error(res, "Part not found", 404);
    return success(res, part, "Part fetched");
  } catch (err) {
    return error(res, "Failed to fetch part", 500, err.message);
  }
};

export const updatePartHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PartService.updatePart(id, req.body);
    if (!updated) return error(res, "Part not found", 404);
    return success(res, updated, "Part updated");
  } catch (err) {
    return error(res, "Failed to update part", 500, err.message);
  }
};

export const deletePartHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await PartService.deletePart(id);
    return success(res, null, "Part deleted", 204);
  } catch (err) {
    return error(res, "Failed to delete part", 500, err.message);
  }
};


export const addPartToTaskHandler = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { partId, quantity, notes } = req.body;
    const taskPart = await PartService.addPartToTask(taskId, partId, quantity, notes);
    return success(res, taskPart, "Part added to task", 201);
  } catch (err) {
    return error(res, err.message || "Failed to add part to task", 500, err.message);
  }
};

export const getTaskPartsHandler = async (req, res) => {
  try {
    const { taskId } = req.params;
    const parts = await PartService.getTaskParts(taskId);
    return success(res, parts, "Task parts fetched");
  } catch (err) {
    return error(res, "Failed to fetch task parts", 500, err.message);
  }
};

export const removePartFromTaskHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await PartService.removePartFromTask(id);
    return success(res, null, "Part removed from task", 204);
  } catch (err) {
    return error(res, "Failed to remove part", 500, err.message);
  }
};
