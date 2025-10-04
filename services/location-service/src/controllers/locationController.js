import Request from "../models/request.model.js";

const locationController = {
  updateLocation: async (req, res) => {
    const { requestId, customerId, lat, lng } = req.body;

    if (!customerId || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const updated = await Request.findOneAndUpdate(
        { _id: requestId, customerId },
        { $set: { lastCustomerLoc: { lat, lng, at: new Date() } } }
      );
      if (!updated) {
        return res.status(404).json({ message: "Request not found" });
      }
      return res.status(200).json({ message: "Location updated successfully" });
    } catch (error) {
      console.error("Error updating location:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  testLocation: (req, res) => {
    res.status(200).json({ message: "Location service is up and running!" });
  },
};

export default locationController;
