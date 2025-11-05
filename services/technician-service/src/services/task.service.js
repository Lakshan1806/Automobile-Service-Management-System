import Task from "../models/task.model.js";
import Progress from "../models/progress.model.js";
import eventEmitter from "../utils/event-emitter.js";

export const createTask = async (taskData) => {
  const task = await Task.create(taskData);
  eventEmitter.emit("task.created", { taskId: task._id, title: task.title });
  return task;
};

export const getTasks = async (filter = {}, options = {}) => {
  const { limit = 50, skip = 0 } = options;
  return Task.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
};

export const getTaskById = async (id) => {
  return Task.findById(id);
};

export const updateTask = async (id, data) => {
  const task = await Task.findByIdAndUpdate(id, data, { new: true });
  eventEmitter.emit("task.updated", { taskId: id, changes: data });
  return task;
};

export const deleteTask = async (id) => {
  return Task.findByIdAndDelete(id);
};

export const addProgress = async (taskId, message, createdBy = null) => {
  const progress = await Progress.create({ task: taskId, message, createdBy });
  eventEmitter.emit("task.progress", { taskId, progressId: progress._id });
  return progress;
};
