import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { verifyAuth, type AuthUser } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function PATCH(req: NextRequest) {
  let authUser: AuthUser | null = null;
  try {
    try {
      authUser = verifyAuth(req);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

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
