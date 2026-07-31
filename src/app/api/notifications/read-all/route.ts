import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    await connectDB();
    const result = await Notification.updateMany({ read: false }, { read: true });

    await logActivity({
      ...buildActor(req, authUser),
      action: "mark_all_notifications_read",
      details: `Marked ${result.modifiedCount} notifications as read`,
      metadata: { count: result.modifiedCount },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    await logError({ req, error: err, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
