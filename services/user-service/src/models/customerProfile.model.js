import mongoose from "mongoose";

const customerProfileSchema = new mongoose.Schema(
  {
    customerId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    telephoneNumber: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const CustomerProfile = mongoose.model("CustomerProfile", customerProfileSchema);

export default CustomerProfile;
