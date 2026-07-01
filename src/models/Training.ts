import mongoose, { Schema, Document } from "mongoose";

export interface ITraining extends Document {
  name: string;
  description: string;
  price: number;
  duration: string;
  format: "In-person" | "Online" | "Hybrid";
  category: string;
  status: "active" | "inactive" | "coming soon";
  available: boolean;
  imageUrl: string;
  maxParticipants: number | null;
  currentParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: String, default: "4 weeks", trim: true },
    format: { type: String, default: "In-person", enum: ["In-person", "Online", "Hybrid"] },
    category: { type: String, default: "", trim: true },
    status: { type: String, enum: ["active", "inactive", "coming soon"], default: "active" },
    available: { type: Boolean, default: true },
    imageUrl: { type: String, default: "", trim: true },
    maxParticipants: { type: Number, default: null, min: 0 },
    currentParticipants: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

trainingSchema.index({ status: 1, available: 1 });

export default mongoose.models.Training || mongoose.model<ITraining>("Training", trainingSchema);
