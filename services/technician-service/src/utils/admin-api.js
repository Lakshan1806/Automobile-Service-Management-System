import axios from "axios";

const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || "http://localhost:8000/api";

// Configure axios to always request JSON
const api = axios.create({
  baseURL: ADMIN_SERVICE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

/**
 * Fetch all services from admin_service
 */
export const fetchServicesFromAdmin = async () => {
  try {
    const response = await api.get('/public/services/');
    console.log('Fetched services from admin:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching services from admin service:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw new Error("Failed to fetch services from admin service");
  }
};

/**
 * Fetch a specific service by ID from admin_service
 */
export const fetchServiceByIdFromAdmin = async (serviceId) => {
  try {
    const response = await api.get(`/public/services/${serviceId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service ${serviceId} from admin service:`, error.message);
    throw new Error("Failed to fetch service from admin service");
  }
};

/**
 * Fetch all products (parts) from admin_service
 */
export const fetchProductsFromAdmin = async () => {
  try {
    const response = await api.get('/public/products/');
    console.log('Fetched products from admin:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching products from admin service:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw new Error("Failed to fetch products from admin service");
  }
};

/**
 * Fetch a specific product by ID from admin_service
 */
export const fetchProductByIdFromAdmin = async (productId) => {
  try {
    const response = await api.get(`/public/products/${productId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${productId} from admin service:`, error.message);
    throw new Error("Failed to fetch product from admin service");
  }
};

/**
 * Update product stock in admin_service (when a part is used)
 */
export const updateProductStockInAdmin = async (productId, quantityUsed) => {
  try {
    // First get current stock
    const product = await fetchProductByIdFromAdmin(productId);
    const newStock = product.stock - quantityUsed;

    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }

    // Update stock using public endpoint
    const response = await api.patch(
      `/public/products/${productId}/stock/`,
      { stock: newStock }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating product stock in admin service:`, error.message);
    throw error;
  }
};
