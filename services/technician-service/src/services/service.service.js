import Service from "../models/service.model.js";
import { fetchServicesFromAdmin, fetchServiceByIdFromAdmin } from "../utils/admin-api.js";

/**
 * Get all services from admin_service (MySQL)
 * This replaces local service creation - services are managed in admin_service
 */
export const getServices = async (filter = {}) => {
  try {
    const adminServices = await fetchServicesFromAdmin();
    
    // Map admin service data to match expected format
    return adminServices.map(service => ({
      _id: service.service_id,
      service_id: service.service_id,
      name: service.name,
      description: service.description,
      basePrice: parseFloat(service.price),
      isActive: true, // Admin services are assumed active
      source: "admin_service"
    }));
  } catch (error) {
    console.error("Error fetching services from admin:", error);
    // Fallback to local MongoDB services if admin service is unavailable
    return Service.find(filter).sort({ name: 1 });
  }
};

/**
 * Get service by ID from admin_service
 */
export const getServiceById = async (id) => {
  try {
    const adminService = await fetchServiceByIdFromAdmin(id);
    
    return {
      _id: adminService.service_id,
      service_id: adminService.service_id,
      name: adminService.name,
      description: adminService.description,
      basePrice: parseFloat(adminService.price),
      isActive: true,
      source: "admin_service"
    };
  } catch (error) {
    console.error(`Error fetching service ${id} from admin:`, error);
    // Fallback to local MongoDB
    return Service.findById(id);
  }
};

/**
 * Get active services from admin_service
 */
export const getActiveServices = async () => {
  return getServices({ isActive: true });
};

// Legacy functions kept for backward compatibility (now deprecated)
export const createService = async (data) => {
  console.warn("⚠️  createService is deprecated. Services should be created in admin_service.");
  return Service.create(data);
};

export const updateService = async (id, data) => {
  console.warn("⚠️  updateService is deprecated. Services should be updated in admin_service.");
  return Service.findByIdAndUpdate(id, data, { new: true });
};

export const deleteService = async (id) => {
  console.warn("⚠️  deleteService is deprecated. Services should be deleted in admin_service.");
  return Service.findByIdAndDelete(id);
};
