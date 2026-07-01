import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  type: "new_order" | "new_contact" | "new_user" | "order_status" | "system";
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: { type: String, enum: ["new_order", "new_contact", "new_user", "order_status", "system"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);
