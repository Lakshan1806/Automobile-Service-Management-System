import Service from "../models/service.model.js";

export const createService = async (data) => {
  return Service.create(data);
};

export const getServices = async (filter = {}) => {
  return Service.find(filter).sort({ name: 1 });
};

export const getServiceById = async (id) => {
  return Service.findById(id);
};

export const updateService = async (id, data) => {
  return Service.findByIdAndUpdate(id, data, { new: true });
};

export const deleteService = async (id) => {
  return Service.findByIdAndDelete(id);
};

export const getActiveServices = async () => {
  return Service.find({ isActive: true }).sort({ name: 1 });
};
