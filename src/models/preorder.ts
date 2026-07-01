import mongoose, { Schema, Document } from "mongoose";

export interface IPreorder extends Document {
  product: string;
  customer: string;
  email: string;
  quantity: number;
  deliveryDate: Date | null;
  status: "pending" | "confirmed" | "shipped" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const preorderSchema = new Schema<IPreorder>(
  {
    product: { type: String, required: true },
    customer: { type: String, required: true },
    email: { type: String },
    quantity: { type: Number, required: true },
    deliveryDate: { type: Date },
    status: { type: String, enum: ["pending", "confirmed", "shipped", "completed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Preorder || mongoose.model<IPreorder>("Preorder", preorderSchema);
