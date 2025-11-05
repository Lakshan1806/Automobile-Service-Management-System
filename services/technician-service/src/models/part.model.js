import mongoose from "mongoose";

const PartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  partNumber: { type: String, unique: true, sparse: true },
  description: { type: String },
  category: {
    type: String,
    enum: ["engine", "brake", "suspension", "electrical", "body", "fluid", "filter", "tire", "other"],
    default: "other",
  },
  unitPrice: { type: Number, required: true },
  quantityInStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 0 },
  supplier: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PartSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Part", PartSchema);
