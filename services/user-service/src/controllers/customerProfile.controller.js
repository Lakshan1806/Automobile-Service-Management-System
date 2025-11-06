import CustomerProfile from "../models/customerProfile.model.js";

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
};

export default CustomerProfileController;
