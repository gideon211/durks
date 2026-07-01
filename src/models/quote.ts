import mongoose, { Schema, Document } from "mongoose";

export interface IQuote extends Document {
  company: string;
  email: string;
  phone: string;
  quantity: number;
  product: string;
  estimatedTotal: number;
  notes: string;
  status: "pending" | "approved" | "converted" | "denied";
  createdAt: Date;
  updatedAt: Date;
}

const quoteSchema = new Schema<IQuote>(
  {
    company: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    quantity: { type: Number, required: true },
    product: { type: String },
    estimatedTotal: { type: Number, default: 0 },
    notes: { type: String },
    status: { type: String, enum: ["pending", "approved", "converted", "denied"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Quote || mongoose.model<IQuote>("Quote", quoteSchema);
