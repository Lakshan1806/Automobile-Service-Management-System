import Request from "../models/request.model.js";

const locationController = {
  updateLocation: async (req, res) => {
    const { requestId, technicianId, customerId, lat, lng } = req.body;

    if (!requestId || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      if (technicianId) {
        const updated = await Request.findOneAndUpdate(
          { _id: requestId, technicianId },
          { $set: { lastTechnicianLoc: { lat, lng, at: new Date() } } }
        );
        if (!updated) {
          return res.status(404).json({ message: "Request not found" });
        }
      } else if (customerId) {
        const updated = await Request.findOneAndUpdate(
          { _id: requestId, customerId },
          { $set: { lastCustomerLoc: { lat, lng, at: new Date() } } }
        );
        if (!updated) {
          return res.status(404).json({ message: "Request not found" });
        }
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

  getTechnicianLocation: async (req, res) => {
    const { requestId } = req.query;
    if (!requestId) {
      return res.status(400).json({ message: "Missing requestId" });
    }

    try {
      const request = await Request.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      const { lastTechnicianLoc } = request;
      return res.status(200).json(lastTechnicianLoc);
    } catch (error) {
      console.error("Error fetching technician location:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getCustomerLocation: async (req, res) => {
    const { requestId } = req.query;
    if (!requestId) {
      return res.status(400).json({ message: "Missing requestId" });
    }

    try {
      const request = await Request.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      const { lastCustomerLoc } = request;
      return res.status(200).json(lastCustomerLoc);
    } catch (error) {
      console.error("Error fetching customer location:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getPolyline: async (req, res) => {
    const ROUTES_ENDPOINT =
      "https://routes.googleapis.com/directions/v2:computeRoutes";
    const API_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY;

    try {
      const { origin, destination, mode = "DRIVE" } = req.body || {};
      if (
        !origin?.lat ||
        !origin?.lng ||
        !destination?.lat ||
        !destination?.lng
      ) {
        return res
          .status(400)
          .json({ error: "Missing origin/destination lat/lng" });
      }

      const body = {
        origin: {
          location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
        },
        destination: {
          location: {
            latLng: { latitude: destination.lat, longitude: destination.lng },
          },
        },
        travelMode: String(mode).toUpperCase(),
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        polylineQuality: "OVERVIEW",
      };

      const fieldMask =
        "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration";

      const resp = await fetch(`${ROUTES_ENDPOINT}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask": fieldMask,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        return res
          .status(resp.status)
          .json({ error: "Routes API error", details: text });
      }

      const data = await resp.json();
      const route = data.routes?.[0];
      if (!route) return res.status(404).json({ error: "No route found" });

      return res.json({
        polyline: route.polyline?.encodedPolyline, 
        distanceMeters: route.distanceMeters, 
        duration: route.duration, 
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Server error" });
    }
  },
};

export default locationController;
