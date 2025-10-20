import ServicePart from "../models/ServicePart.js";

// Get services/parts
export const getServices = async (req, res) => {
  try {
    const services = await ServicePart.find({ category: "service" });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getParts = async (req, res) => {
  try {
    const parts = await ServicePart.find({ category: "part" });
    res.json(parts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
