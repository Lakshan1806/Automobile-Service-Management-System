import Part from "../models/part.model.js";
import TaskPart from "../models/task-part.model.js";


export const createPart = async (data) => {
  return Part.create(data);
};

export const getParts = async (filter = {}) => {
  return Part.find(filter).sort({ name: 1 });
};

export const getPartById = async (id) => {
  return Part.findById(id);
};

export const updatePart = async (id, data) => {
  return Part.findByIdAndUpdate(id, data, { new: true });
};

export const deletePart = async (id) => {
  return Part.findByIdAndDelete(id);
};

export const getActiveParts = async () => {
  return Part.find({ isActive: true }).sort({ name: 1 });
};

export const getLowStockParts = async () => {
  return Part.find({
    $expr: { $lte: ["$quantityInStock", "$minimumStock"] },
  }).sort({ quantityInStock: 1 });
};


export const addPartToTask = async (taskId, partId, quantity, notes = null) => {
  const part = await Part.findById(partId);
  if (!part) throw new Error("Part not found");
  if (part.quantityInStock < quantity) {
    throw new Error("Insufficient stock");
  }

  const taskPart = await TaskPart.create({
    task: taskId,
    part: partId,
    quantity,
    unitPrice: part.unitPrice,
    notes,
  });


  part.quantityInStock -= quantity;
  await part.save();

  return taskPart;
};

export const getTaskParts = async (taskId) => {
  return TaskPart.find({ task: taskId }).populate("part");
};

export const removePartFromTask = async (taskPartId) => {
  const taskPart = await TaskPart.findById(taskPartId);
  if (!taskPart) throw new Error("TaskPart not found");


  const part = await Part.findById(taskPart.part);
  if (part) {
    part.quantityInStock += taskPart.quantity;
    await part.save();
  }

  return TaskPart.findByIdAndDelete(taskPartId);
};
