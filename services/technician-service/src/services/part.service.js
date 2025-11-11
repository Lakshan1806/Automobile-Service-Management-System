import Part from "../models/part.model.js";
import TaskPart from "../models/task-part.model.js";
import { 
  fetchProductsFromAdmin, 
  fetchProductByIdFromAdmin,
  updateProductStockInAdmin 
} from "../utils/admin-api.js";

/**
 * Get all parts from admin_service (products)
 * This replaces local part creation - parts are managed in admin_service
 */
export const getParts = async (filter = {}) => {
  try {
    const adminProducts = await fetchProductsFromAdmin();
    
    // Map admin product data to match expected part format
    return adminProducts.map(product => ({
      _id: product.product_id,
      product_id: product.product_id,
      name: product.name,
      description: product.description,
      unitPrice: parseFloat(product.price),
      quantityInStock: product.stock,
      minimumStock: 0, // Not available in admin service
      isActive: true,
      source: "admin_service"
    }));
  } catch (error) {
    console.error("Error fetching products from admin:", error);
    // Fallback to local MongoDB parts if admin service is unavailable
    return Part.find(filter).sort({ name: 1 });
  }
};

/**
 * Get part by ID from admin_service
 */
export const getPartById = async (id) => {
  try {
    const adminProduct = await fetchProductByIdFromAdmin(id);
    
    return {
      _id: adminProduct.product_id,
      product_id: adminProduct.product_id,
      name: adminProduct.name,
      description: adminProduct.description,
      unitPrice: parseFloat(adminProduct.price),
      quantityInStock: adminProduct.stock,
      minimumStock: 0,
      isActive: true,
      source: "admin_service"
    };
  } catch (error) {
    console.error(`Error fetching product ${id} from admin:`, error);
    // Fallback to local MongoDB
    return Part.findById(id);
  }
};

/**
 * Get active parts from admin_service
 */
export const getActiveParts = async () => {
  return getParts({ isActive: true });
};

/**
 * Get low stock parts (fallback to local only for now)
 */
export const getLowStockParts = async () => {
  // This would need to be implemented in admin_service API
  // For now, fallback to local MongoDB
  return Part.find({
    $expr: { $lte: ["$quantityInStock", "$minimumStock"] },
  }).sort({ quantityInStock: 1 });
};

/**
 * Add part to task - now updates stock in admin_service
 */
export const addPartToTask = async (taskId, partId, quantity, notes = null) => {
  try {
    // Get part from admin service
    const part = await getPartById(partId);
    if (!part) throw new Error("Part not found");
    if (part.quantityInStock < quantity) {
      throw new Error("Insufficient stock");
    }

    // Create task-part record
    const taskPart = await TaskPart.create({
      task: taskId,
      part: partId,
      quantity,
      unitPrice: part.unitPrice,
      notes,
    });

    // Update stock in admin service
    if (part.source === "admin_service") {
      await updateProductStockInAdmin(partId, quantity);
    } else {
      // Fallback for local parts
      const localPart = await Part.findById(partId);
      if (localPart) {
        localPart.quantityInStock -= quantity;
        await localPart.save();
      }
    }

    return taskPart;
  } catch (error) {
    console.error("Error adding part to task:", error);
    throw error;
  }
};

/**
 * Get parts used in a task
 */
export const getTaskParts = async (taskId) => {
  return TaskPart.find({ task: taskId }).populate("part");
};

/**
 * Remove part from task - restores stock in admin_service
 */
export const removePartFromTask = async (taskPartId) => {
  const taskPart = await TaskPart.findById(taskPartId);
  if (!taskPart) throw new Error("TaskPart not found");

  try {
    // Get part info to determine source
    const part = await getPartById(taskPart.part);
    
    if (part && part.source === "admin_service") {
      // Restore stock in admin service (negative quantity to add back)
      await updateProductStockInAdmin(taskPart.part, -taskPart.quantity);
    } else {
      // Fallback for local parts
      const localPart = await Part.findById(taskPart.part);
      if (localPart) {
        localPart.quantityInStock += taskPart.quantity;
        await localPart.save();
      }
    }
  } catch (error) {
    console.error("Error restoring part stock:", error);
  }

  return TaskPart.findByIdAndDelete(taskPartId);
};

// Legacy functions kept for backward compatibility (now deprecated)
export const createPart = async (data) => {
  console.warn("⚠️  createPart is deprecated. Parts should be created in admin_service.");
  return Part.create(data);
};

export const updatePart = async (id, data) => {
  console.warn("⚠️  updatePart is deprecated. Parts should be updated in admin_service.");
  return Part.findByIdAndUpdate(id, data, { new: true });
};

export const deletePart = async (id) => {
  console.warn("⚠️  deletePart is deprecated. Parts should be deleted in admin_service.");
  return Part.findByIdAndDelete(id);
};
