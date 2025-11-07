import crypto from "crypto";
import Request from "../models/request.model.js";

function generateReference() {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `RSA-${suffix}`;
}

const locationController = {
  listRoadsideRequests: async (_req, res) => {
    try {
      const requests = await Request.find({
        requestType: "roadside_assistance",
      })
        .sort({ createdAt: -1 })
        .lean();

      const response = requests.map((request) => ({
        id: request._id.toString(),
        reference: request.reference,
        status: request.status,
        description: request.description,
        customer: {
          id: request.customerId,
          name: request.customerName,
          email: request.customerEmail,
        },
        vehicle: {
          id: request.vehicle?.id ?? null,
          brand: request.vehicle?.brand ?? null,
          model: request.vehicle?.model ?? null,
          numberPlate: request.vehicle?.numberPlate ?? null,
        },
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      }));

      return res.json(response);
    } catch (error) {
      console.error("Failed to list roadside assistance requests:", error);
      return res.status(500).json({ message: "Unable to fetch requests" });
    }
  },

  createRoadsideAssistanceRequest: async (req, res) => {
    const { customer, vehicle, description } = req.body || {};

    if (
      !customer?.id ||
      !customer?.name ||
      !customer?.email ||
      !vehicle?.id ||
      !vehicle?.brand ||
      !vehicle?.numberPlate ||
      !description
    ) {
      return res.status(400).json({
        message:
          "customer (id, name, email), vehicle (id, brand, numberPlate), and description are required",
      });
    }

    const payload = {
      customerId: String(customer.id),
      customerName: customer.name.trim(),
      customerEmail: customer.email.trim().toLowerCase(),
      vehicle: {
        id: String(vehicle.id),
        brand: vehicle.brand.trim(),
        model: vehicle.model ? vehicle.model.trim() : null,
        numberPlate: vehicle.numberPlate.trim().toUpperCase(),
      },
      description: description.trim(),
    };

    if (payload.description.length === 0) {
      return res.status(400).json({ message: "description cannot be empty" });
    }

    try {
      const roadsideRequest = await Request.create({
        customerId: payload.customerId,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        vehicle: payload.vehicle,
        description: payload.description,
        requestType: "roadside_assistance",
        reference: generateReference(),
      });

      return res.status(201).json({
        requestId: roadsideRequest._id.toString(),
        reference: roadsideRequest.reference,
        status: roadsideRequest.status,
      });
    } catch (error) {
      console.error("Failed to create roadside assistance request:", error);
      return res.status(500).json({ message: "Unable to create request" });
    }
  },

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
