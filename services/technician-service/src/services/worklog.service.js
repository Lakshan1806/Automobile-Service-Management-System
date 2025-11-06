import Worklog from "../models/worklog.model.js";

export const createWorklog = async (data) => {
  return Worklog.create(data);
};

export const getWorklogsForTask = async (taskId) => {
  return Worklog.find({ task: taskId }).sort({ startTime: -1 });
};

export const updateWorklog = async (id, data) => {
  return Worklog.findByIdAndUpdate(id, data, { new: true });
};
