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

  async createForCustomer(req, res) {
    const customerId = parseCustomerId(req.params.customerId);
    if (customerId === null) {
      return res.status(400).json({ message: "customerId must be a valid number" });
    }

    try {
      const profile = await CustomerProfile.findOne({ customerId });
      if (!profile) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      const {
        numberPlate,
        noPlate,
        chassisNo,
        chaseNo,
        vehicleType,
        vehicleBrand,
        vehicleModel,
        mileage,
        millage,
        lastServiceDate,
        vehicleModelYear,
        vehicleRegistrationYear,
      } = req.body ?? {};

      const resolvedNumberPlate = (numberPlate ?? noPlate)?.toString().trim();
      const resolvedChassisNo = (chassisNo ?? chaseNo)?.toString().trim();
      const resolvedVehicleBrand =
        typeof vehicleBrand === "string" ? vehicleBrand.trim() : "";
      const resolvedVehicleModel = vehicleModel?.toString().trim();
      const resolvedMileage = Number.isFinite(Number(mileage ?? millage))
        ? Number(mileage ?? millage)
        : undefined;

      if (!resolvedNumberPlate) {
        return res.status(400).json({ message: "numberPlate is required" });
      }
      if (!resolvedChassisNo) {
        return res.status(400).json({ message: "chassisNo is required" });
      }
      if (!resolvedVehicleBrand) {
        return res.status(400).json({ message: "vehicleBrand is required" });
      }
      if (!resolvedVehicleModel) {
        return res.status(400).json({ message: "vehicleModel is required" });
      }

      const payload = {
        customerProfile: profile._id,
        customerId,
        numberPlate: resolvedNumberPlate.toUpperCase(),
        chassisNo: resolvedChassisNo.toUpperCase(),
        vehicleType: typeof vehicleType === "string" ? vehicleType.trim().toUpperCase() : undefined,
        vehicleBrand: resolvedVehicleBrand,
        vehicleModel: resolvedVehicleModel,
        mileage: resolvedMileage ?? 0,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : undefined,
        vehicleModelYear: Number.isFinite(Number(vehicleModelYear)) ? Number(vehicleModelYear) : undefined,
        vehicleRegistrationYear: Number.isFinite(Number(vehicleRegistrationYear))
          ? Number(vehicleRegistrationYear)
          : undefined,
      };

      const vehicle = await Vehicle.create(payload);

      return res.status(201).json({
        vehicle: {
          vehicleId: vehicle._id.toString(),
          numberPlate: vehicle.numberPlate,
          vehicleBrand: vehicle.vehicleBrand,
          vehicleModel: vehicle.vehicleModel,
          vehicleType: vehicle.vehicleType,
          mileage: vehicle.mileage,
          vehicleModelYear: vehicle.vehicleModelYear ?? null,
          vehicleRegistrationYear: vehicle.vehicleRegistrationYear ?? null,
          lastServiceDate: vehicle.lastServiceDate,
        },
      });
    } catch (error) {
      if (error && error.code === 11000) {
        const fields = Object.keys(error.keyPattern || {});
        return res
          .status(409)
          .json({ message: `Vehicle with duplicate ${fields.join(", ") || "unique field"}` });
      }
      console.error("Failed to create vehicle for customer", error);
      return res.status(500).json({ message: "Unable to add vehicle" });
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
