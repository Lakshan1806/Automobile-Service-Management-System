import Worklog from "../models/worklog.model.js";

export const createWorklog = async (data) => {
  return Worklog.create(data);
};

export const getWorklogsForTask = async (taskId) => {
  return Worklog.find({ task: taskId }).sort({ startTime: -1 });
};

export const updateWorklog = async (id, data) => {
  const worklog = await Worklog.findById(id);
  if (!worklog) return null;

  Object.assign(worklog, data);

  await worklog.save();
  
  return worklog;
};
