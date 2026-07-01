import mongoose, { Schema, Document } from "mongoose";

export interface IParticipant {
  fullName: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
}

export interface ITrainingRegistration extends Document {
  userId: mongoose.Types.ObjectId | null;
  participant: IParticipant;
  trainingId: mongoose.Types.ObjectId;
  trainingName: string;
  price: number;
  duration: string;
  format: string;
  startDate: Date;
  schedule: string;
  paystackReference: string;
  paymentStatus: "pending" | "paid" | "refunded";
  registrationStatus: "confirmed" | "in-progress" | "completed" | "cancelled";
  registrationNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IParticipant>(
  {
    fullName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    phone: { type: String, trim: true, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"], required: true },
  },
  { _id: false }
);

const trainingRegistrationSchema = new Schema<ITrainingRegistration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    participant: { type: participantSchema, required: true },
    trainingId: { type: Schema.Types.ObjectId, ref: "Training", required: true, index: true },
    trainingName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: String, default: "4 weeks", trim: true },
    format: { type: String, default: "In-person", trim: true },
    startDate: { type: Date, required: true },
    schedule: { type: String, required: true, trim: true },
    paystackReference: { type: String, required: true, trim: true, unique: true, index: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
    registrationStatus: { type: String, enum: ["confirmed", "in-progress", "completed", "cancelled"], default: "confirmed" },
    registrationNumber: { type: String, trim: true, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

trainingRegistrationSchema.index({ createdAt: -1 });
trainingRegistrationSchema.index({ userId: 1 });
trainingRegistrationSchema.index({ trainingId: 1 });
trainingRegistrationSchema.index({ paymentStatus: 1 });
trainingRegistrationSchema.index({ registrationStatus: 1 });

export default mongoose.models.TrainingRegistration ||
  mongoose.model<ITrainingRegistration>("TrainingRegistration", trainingRegistrationSchema);
