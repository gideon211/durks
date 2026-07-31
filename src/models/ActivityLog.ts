import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId | null;
  email: string | null;
  action: string;
  details: string;
  metadata: Record<string, unknown>;
  ip: string | null;
  isAdmin: boolean;
  route: string | null;
  method: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    email: { type: String, default: null },
    action: { type: String, required: true },
    details: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    route: { type: String, default: null },
    method: { type: String, default: null },
  },
  { timestamps: true }
);

activityLogSchema.index({ email: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ isAdmin: 1, createdAt: -1 });

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
