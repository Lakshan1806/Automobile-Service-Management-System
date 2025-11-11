import Worklog from "../models/worklog.model.js";
import { fetchServiceByIdFromAdmin, fetchProductByIdFromAdmin, updateProductStockInAdmin } from "../utils/admin-api.js";

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

/**
 * Add service information to a worklog
 * Fetches service details from admin service
 */
export const addServiceToWorklog = async (worklogId, serviceId, io) => {
  const worklog = await Worklog.findById(worklogId);
  if (!worklog) {
    throw new Error('Worklog not found');
  }

  // Fetch service details from admin service
  const service = await fetchServiceByIdFromAdmin(serviceId);
  if (!service) {
    throw new Error('Service not found in admin service');
  }

  // Add service info to worklog
  worklog.service = {
    service_id: service.service_id,
    name: service.name,
    price: service.price
  };

  await worklog.save();
  
  // Emit real-time update
  if (io) {
    io.to(`task-${worklog.task}`).emit('worklog-updated', {
      type: 'service-added',
      worklogId: worklog._id,
      taskId: worklog.task,
      service: worklog.service,
      totalCost: worklog.totalCost,
      timestamp: new Date()
    });
  }
  
  return worklog;
};

/**
 * Add a product/part to a worklog
 * Updates stock in admin service and adds to worklog
 */
export const addProductToWorklog = async (worklogId, productId, quantityUsed, io) => {
  const worklog = await Worklog.findById(worklogId);
  if (!worklog) {
    throw new Error('Worklog not found');
  }

  // Fetch product details from admin service
  const product = await fetchProductByIdFromAdmin(productId);
  if (!product) {
    throw new Error('Product not found in admin service');
  }

  // Check if enough stock available
  if (product.stock < quantityUsed) {
    throw new Error(`Insufficient stock. Available: ${product.stock}, Required: ${quantityUsed}`);
  }

  // Calculate costs
  const unitPrice = product.price;
  const totalPrice = unitPrice * quantityUsed;

  // Check if product already exists in worklog
  const existingProductIndex = worklog.productsUsed.findIndex(p => p.product_id === productId);
  
  if (existingProductIndex >= 0) {
    // Update existing product
    worklog.productsUsed[existingProductIndex].quantityUsed += quantityUsed;
    worklog.productsUsed[existingProductIndex].totalPrice += totalPrice;
  } else {
    // Add new product
    worklog.productsUsed.push({
      product_id: product.product_id,
      name: product.name,
      quantityUsed,
      unitPrice,
      totalPrice
    });
  }

  // Update stock in admin service
  const newStock = product.stock - quantityUsed;
  await updateProductStockInAdmin(productId, newStock);

  // Save worklog (pre-save hook will calculate totalCost)
  await worklog.save();

  // Emit real-time update
  if (io) {
    io.to(`task-${worklog.task}`).emit('worklog-updated', {
      type: 'product-added',
      worklogId: worklog._id,
      taskId: worklog.task,
      product: {
        product_id: productId,
        name: product.name,
        quantityUsed,
        unitPrice,
        totalPrice
      },
      totalCost: worklog.totalCost,
      timestamp: new Date()
    });
  }

  return worklog;
};

/**
 * Get worklog by ID with full details
 */
export const getWorklogById = async (id) => {
  return Worklog.findById(id);
};
