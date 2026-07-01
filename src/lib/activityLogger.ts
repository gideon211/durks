import connectDB from "./mongodb";
import ActivityLog from "@/models/ActivityLog";

export async function logActivity({
  user = null,
  email = null,
  action,
  details = "",
  metadata = {},
  ip = null,
  isAdmin = false,
}: {
  user?: string | null;
  email?: string | null;
  action: string;
  details?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  isAdmin?: boolean;
}) {
  if (isAdmin) return;
  try {
    await connectDB();
    await ActivityLog.create({ user, email, action, details, metadata, ip });
  } catch (err) {
    console.error("logActivity error:", err);
  }
}
