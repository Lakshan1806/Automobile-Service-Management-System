import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    customerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerProfile",
      required: true,
    },
    customerId: {
      type: Number,
      required: true,
    },

    numberPlate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    chassisNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ["CAR", "SUV", "TRUCK", "VAN", "MOTORCYCLE", "OTHER"],
      default: "CAR",
      uppercase: true,
      trim: true,
    },
    vehicleBrand: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },
    mileage: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastServiceDate: {
      type: Date,
    },
    vehicleModelYear: {
      type: Number,
      min: 1900,
    },
    vehicleRegistrationYear: {
      type: Number,
      min: 1900,
    },
  },
  { timestamps: true }
);


const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
