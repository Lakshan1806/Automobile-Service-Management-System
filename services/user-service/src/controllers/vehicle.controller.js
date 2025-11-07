import mongoose from "mongoose";
import CustomerProfile from "../models/customerProfile.model.js";
import Vehicle from "../models/vehicle.model.js";
import authServiceClient from "../clients/authServiceClient.js";
import { parseCustomerId } from "../utils/parsers.js";

function toTitleCase(value) {
  if (!value) {
    return value;
  }
  const lower = value.toString().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatDateOnly(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split("T")[0];
}

const VehicleController = {
  async listByCustomer(req, res) {
    const customerId = parseCustomerId(req.params.customerId);
    if (customerId === null) {
      return res.status(400).json({ message: "customerId must be a valid number" });
    }

    try {
      const vehicles = await Vehicle.find({ customerId })
        .select(["numberPlate", "vehicleBrand", "vehicleModel"])
        .sort({ createdAt: -1 })
        .lean();

      return res.json(
        vehicles.map((vehicle) => ({
          vehicleId: vehicle._id.toString(),
          noPlate: vehicle.numberPlate,
          vehicleBrand: vehicle.vehicleBrand,
          vehicleModel: vehicle.vehicleModel,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch vehicles for customer", error);
      return res.status(500).json({ message: "Unable to fetch vehicles" });
    }
  },

  async getAppointmentDetails(req, res) {
    const { vehicleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: "vehicleId must be a valid Mongo ObjectId" });
    }

    try {
      const vehicle = await Vehicle.findById(vehicleId).lean();
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const profile = await CustomerProfile.findById(vehicle.customerProfile).lean();
      if (!profile) {
        return res.status(404).json({ message: "Customer profile not found for vehicle" });
      }

      const authCustomer = await authServiceClient.getCustomer(vehicle.customerId);

      return res.json({
        vehicleId: vehicle._id.toString(),
        noPlate: vehicle.numberPlate,
        chaseNo: vehicle.chassisNo,
        vehicleType: toTitleCase(vehicle.vehicleType),
        vehicleBrand: vehicle.vehicleBrand,
        customerId: vehicle.customerId,
        customerPhone: profile.telephoneNumber ?? "",
        customerAddress: profile.address ?? "",
        customerName: authCustomer?.name ?? null,
        customerEmail: authCustomer?.email ?? null,
        millage: vehicle.mileage ?? 0,
        lastServiceDate: formatDateOnly(vehicle.lastServiceDate),
        vehicleModelYear: vehicle.vehicleModelYear ?? null,
        vehicleRegistrationYear: vehicle.vehicleRegistrationYear ?? null,
        vehicleModel: vehicle.vehicleModel ?? null,
      });
    } catch (error) {
      console.error("Failed to fetch appointment details for vehicle", error);
      return res.status(500).json({ message: "Unable to fetch appointment details" });
    }
  },
};

export default VehicleController;

