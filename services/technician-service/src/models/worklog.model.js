import mongoose from "mongoose";

const WorklogSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: "Technician" },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  durationMinutes: { type: Number },
  notes: { type: String },
  
  // Service performed (from admin_service)
  service: {
    service_id: { type: Number }, // service_id from admin_service
    name: { type: String },
    price: { type: Number }
  },
  
  // Products/parts used during work (from admin_service)
  productsUsed: [{
    product_id: { type: Number, required: true }, // product_id from admin_service
    name: { type: String },
    quantityUsed: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number },
    totalPrice: { type: Number } // unitPrice * quantityUsed
  }],
  
  // Cost calculation
  totalCost: { type: Number, default: 0 }, // service price + products cost
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  parts:{type:String}
});

WorklogSchema.pre("save", function (next) {
  // Calculate duration
  if (this.startTime && this.endTime) {
    const ms = new Date(this.endTime) - new Date(this.startTime);
    this.durationMinutes = Math.round(ms / (1000 * 60));
  }
  
  // Calculate total cost
  let serviceCost = this.service?.price || 0;
  let productsCost = 0;
  
  if (this.productsUsed && this.productsUsed.length > 0) {
    productsCost = this.productsUsed.reduce((sum, product) => {
      return sum + (product.totalPrice || 0);
    }, 0);
  }
  
  this.totalCost = serviceCost + productsCost;
  this.updatedAt = new Date();
  
  next();
});

export default mongoose.model("Worklog", WorklogSchema);
