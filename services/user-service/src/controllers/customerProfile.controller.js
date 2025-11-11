import CustomerProfile from "../models/customerProfile.model.js";
import Vehicle from "../models/vehicle.model.js";
import authServiceClient from "../clients/authServiceClient.js";
import { parseCustomerId } from "../utils/parsers.js";

const CustomerProfileController = {
  async createPlaceholder(req, res) {
    try {
      const { customerId, telephoneNumber, address } = req.body ?? {};

      if (customerId === undefined || customerId === null) {
        return res.status(400).json({ message: "customerId is required" });
      }

      const payload = {
        customerId,
        telephoneNumber: telephoneNumber ?? "",
        address: address ?? "",
      };

      const existing = await CustomerProfile.findOne({ customerId });
      if (existing) {
        return res.status(200).json({ profile: existing });
      }

      const profile = await CustomerProfile.create(payload);
      return res.status(201).json({ profile });
    } catch (error) {
      console.error("Failed to create customer profile placeholder", error);
      return res.status(500).json({ message: "Unable to create customer profile" });
    }
  },

  async updateContactDetails(req, res) {
    try {
      const customerId = parseCustomerId(req.params.customerId);
      if (customerId === null) {
        return res.status(400).json({ message: "customerId must be a valid number" });
      }

      const { telephoneNumber, address } = req.body ?? {};
      const updates = {};

      if (telephoneNumber !== undefined) {
        if (typeof telephoneNumber !== "string" || telephoneNumber.trim().length === 0) {
          return res.status(400).json({ message: "telephoneNumber must be a non-empty string" });
        }
        updates.telephoneNumber = telephoneNumber.trim();
      }

      if (address !== undefined) {
        if (typeof address !== "string" || address.trim().length === 0) {
          return res.status(400).json({ message: "address must be a non-empty string" });
        }
        updates.address = address.trim();
      }

      if (Object.keys(updates).length === 0) {
        return res
          .status(400)
          .json({ message: "Provide at least one of telephoneNumber or address to update" });
      }

      const profile = await CustomerProfile.findOneAndUpdate(
        { customerId },
        updates,
        { new: true },
      );

      if (!profile) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      return res.status(200).json({ profile });
    } catch (error) {
      console.error("Failed to update contact details for customer profile", error);
      return res.status(500).json({ message: "Unable to update customer contact details" });
    }
  },

  async addVehicle(req, res) {
    try {
      const customerId = parseCustomerId(req.params.customerId);
      if (customerId === null) {
        return res.status(400).json({ message: "customerId must be a valid number" });
      }

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
      const resolvedMileage = Number.isFinite(Number(mileage ?? millage))
        ? Number(mileage ?? millage)
        : undefined;
      const resolvedVehicleModel = vehicleModel?.toString().trim();

      if (!resolvedNumberPlate) {
        return res.status(400).json({ message: "numberPlate is required" });
      }
      if (!resolvedChassisNo) {
        return res.status(400).json({ message: "chassisNo is required" });
      }
      if (!vehicleBrand || typeof vehicleBrand !== "string" || vehicleBrand.trim().length === 0) {
        return res.status(400).json({ message: "vehicleBrand is required" });
      }
      if (!resolvedVehicleModel) {
        return res.status(400).json({ message: "vehicleModel is required" });
      }

      const payload = {
        customerProfile: profile._id,
        customerId,
        numberPlate: resolvedNumberPlate,
        chassisNo: resolvedChassisNo,
        vehicleType: typeof vehicleType === "string" ? vehicleType.trim().toUpperCase() : undefined,
        vehicleBrand: vehicleBrand.trim(),
        vehicleModel: resolvedVehicleModel,
        mileage: resolvedMileage ?? 0,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : undefined,
        vehicleModelYear: Number.isFinite(Number(vehicleModelYear)) ? Number(vehicleModelYear) : undefined,
        vehicleRegistrationYear: Number.isFinite(Number(vehicleRegistrationYear))
          ? Number(vehicleRegistrationYear)
          : undefined,
      };

      const vehicle = await Vehicle.create(payload);
      return res.status(201).json({ vehicle });
    } catch (error) {
      if (error && error.code === 11000) {
        const fields = Object.keys(error.keyPattern || {});
        return res
          .status(409)
          .json({ message: `Vehicle with duplicate ${fields.join(", ") || "unique field"}` });
      }
      console.error("Failed to add vehicle for customer profile", error);
      return res.status(500).json({ message: "Unable to add vehicle" });
    }
  },

  async getDetails(req, res) {
    try {
      const customerId = parseCustomerId(req.params.customerId);
      if (customerId === null) {
        return res
          .status(400)
          .json({ message: "customerId must be a valid number" });
      }

      const [profileDoc, authCustomer] = await Promise.all([
        CustomerProfile.findOne({ customerId }).lean(),
        authServiceClient.getCustomer(customerId),
      ]);

      const profile = profileDoc ?? { telephoneNumber: "", address: "" };

      return res.status(200).json({
        customer: {
          id: customerId,
          name: authCustomer?.name ?? null,
          email: authCustomer?.email ?? null,
          telephoneNumber: profile.telephoneNumber ?? "",
          address: profile.address ?? "",
        },
      });
    } catch (error) {
      console.error("Failed to fetch aggregated customer details", error);
      return res
        .status(500)
        .json({ message: "Unable to fetch customer details" });
    }
  },

  async updateDetails(req, res) {
    try {
      const customerId = parseCustomerId(req.params.customerId);
      if (customerId === null) {
        return res
          .status(400)
          .json({ message: "customerId must be a valid number" });
      }

      const {
        name,
        email,
        telephoneNumber,
        address,
      } = req.body ?? {};

      // Update auth-service if name/email are provided
      let authCustomer = null;
      const authz = req.get("authorization");

      const wantsAuthUpdate =
        (typeof name === "string" && name.trim().length > 0) ||
        (typeof email === "string" && email.trim().length > 0);

      if (wantsAuthUpdate) {
        if (!authz) {
          return res.status(401).json({ message: "Missing Authorization token" });
        }
        // Both fields are required by auth-service; enforce simplicity here
        if (!name || !email) {
          return res
            .status(400)
            .json({ message: "Both name and email are required to update profile" });
        }
        authCustomer = await authServiceClient.updateMe(
          { name: name.trim(), email: email.trim() },
          authz,
        );
        if (!authCustomer) {
          return res
            .status(502)
            .json({ message: "Failed to update name/email on authentication service" });
        }
      }

      // Update user-service profile fields if provided
      const updates = {};
      if (telephoneNumber !== undefined) {
        if (typeof telephoneNumber !== "string" || telephoneNumber.trim().length === 0) {
          return res
            .status(400)
            .json({ message: "telephoneNumber must be a non-empty string" });
        }
        updates.telephoneNumber = telephoneNumber.trim();
      }
      if (address !== undefined) {
        if (typeof address !== "string" || address.trim().length === 0) {
          return res.status(400).json({ message: "address must be a non-empty string" });
        }
        updates.address = address.trim();
      }

      let profileDoc = null;
      if (Object.keys(updates).length > 0) {
        profileDoc = await CustomerProfile.findOneAndUpdate(
          { customerId },
          { $set: updates },
          { new: true, upsert: true },
        ).lean();
      } else {
        profileDoc = await CustomerProfile.findOne({ customerId }).lean();
      }

      const profile = profileDoc ?? { telephoneNumber: "", address: "" };

      return res.status(200).json({
        customer: {
          id: customerId,
          name: wantsAuthUpdate ? authCustomer?.name ?? null : undefined,
          email: wantsAuthUpdate ? authCustomer?.email ?? null : undefined,
          telephoneNumber: profile.telephoneNumber ?? "",
          address: profile.address ?? "",
        },
      });
    } catch (error) {
      console.error("Failed to update aggregated customer details", error);
      return res.status(500).json({ message: "Unable to update customer details" });
    }
  },
};

export default CustomerProfileController;
