import mongoose from "mongoose";

const TaskPartSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  part: { type: mongoose.Schema.Types.ObjectId, ref: "Part", required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true }, 
  totalPrice: { type: Number }, 
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

TaskPartSchema.pre("save", function (next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

export default mongoose.model("TaskPart", TaskPartSchema);
