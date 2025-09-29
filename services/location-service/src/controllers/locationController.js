import Request from "../models/request.model.js";

const locationController = {
  updateLocation: async (req, res) => {
    const { requestId, customerId, lat, lng } = req.body;

    if (!customerId || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const request = await Request.findOne({ _id: requestId, customerId });
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
    } catch (error) {
      console.error("Error updating location:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default locationController;
