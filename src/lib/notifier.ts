import connectDB from "./mongodb";
import Notification from "@/models/Notification";

export async function createNotification({
  type,
  title,
  message,
  link = null,
  metadata = {},
}: {
  type: "new_order" | "new_contact" | "new_user" | "order_status" | "system";
  title: string;
  message: string;
  link?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await connectDB();
    const notification = await Notification.create({ type, title, message, link, metadata });
    return notification;
  } catch (err) {
    console.error("createNotification error:", err);
    return null;
  }
}
