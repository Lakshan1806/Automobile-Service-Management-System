import * as ServiceService from "../services/service.service.js";
import { success, error } from "../utils/response.js";

export const createServiceHandler = async (req, res) => {
  try {
    const service = await ServiceService.createService(req.body);
    return success(res, service, "Service created", 201);
  } catch (err) {
    return error(res, "Failed to create service", 500, err.message);
  }
};

export const listServicesHandler = async (req, res) => {
  try {
    const { active } = req.query;
    const services = active === "true" 
      ? await ServiceService.getActiveServices() 
      : await ServiceService.getServices();
    return success(res, services, "Services fetched");
  } catch (err) {
    return error(res, "Failed to fetch services", 500, err.message);
  }
};

export const getServiceHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ServiceService.getServiceById(id);
    if (!service) return error(res, "Service not found", 404);
    return success(res, service, "Service fetched");
  } catch (err) {
    return error(res, "Failed to fetch service", 500, err.message);
  }
};

export const updateServiceHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ServiceService.updateService(id, req.body);
    if (!updated) return error(res, "Service not found", 404);
    return success(res, updated, "Service updated");
  } catch (err) {
    return error(res, "Failed to update service", 500, err.message);
  }
};

export const deleteServiceHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await ServiceService.deleteService(id);
    return success(res, null, "Service deleted", 204);
  } catch (err) {
    return error(res, "Failed to delete service", 500, err.message);
  }
};
