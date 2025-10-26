import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/utils/db.js";
import ServicePart from "./src/models/ServicePart.js";
import WorkRequest from "./src/models/WorkRequest.js";


dotenv.config();
connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await ServicePart.deleteMany();
    await WorkRequest.deleteMany();

    // --- Add dummy services ---
    const services = await ServicePart.insertMany([
      { name: "Oil Change", category: "service" },
      { name: "Engine Tune-up", category: "service" },
      { name: "Brake Inspection", category: "service" },
      { name: "Battery Replacement", category: "service" },
      { name: "AC Service", category: "service" },
    ]);

    // --- Add dummy parts ---
    const parts = await ServicePart.insertMany([
      { name: "Oil Filter", category: "part" },
      { name: "Brake Pads", category: "part" },
      { name: "Air Filter", category: "part" },
      { name: "Battery", category: "part" },
      { name: "Coolant", category: "part" },
    ]);

    // --- Add dummy work requests ---
    const workRequests = await WorkRequest.insertMany([
      {
        title: "Toyota Corolla - Engine Service",
        type: "main",
        assignedTo: "tech_001",
        status: "pending",
      },
      {
        title: "Honda Civic - Brake Adjustment",
        type: "sub",
        assignedTo: "tech_001",
        status: "pending",
      },
      {
        title: "Nissan Sunny - AC Repair",
        type: "main",
        assignedTo: "tech_002",
        status: "pending",
      },
    ]);

    console.log("✅ Dummy data successfully inserted!");
    console.log({
      services: services.length,
      parts: parts.length,
      workRequests: workRequests.length,
    });

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
