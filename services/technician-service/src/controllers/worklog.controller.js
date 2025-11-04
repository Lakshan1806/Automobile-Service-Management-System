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
