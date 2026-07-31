import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    await connectDB();

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find().sort({ createdAt: -1 }).skip(offset).limit(limit),
      Notification.countDocuments(),
      Notification.countDocuments({ read: false }),
    ]);

    return NextResponse.json({ success: true, notifications, total, unreadCount });
  } catch (err) {
    console.error("getNotifications error:", err);
    await logError({ req, error: err, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { id } = await req.json();
    await connectDB();
    await Notification.findByIdAndUpdate(id, { read: true });

    await logActivity({
      ...buildActor(req, authUser),
      action: "mark_notification_read",
      details: "Marked notification as read",
      metadata: { notificationId: id },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    await logError({ req, error: err, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { id } = await req.json();
    await connectDB();
    await Notification.findByIdAndDelete(id);

    await logActivity({
      ...buildActor(req, authUser),
      action: "delete_notification",
      details: "Deleted notification",
      metadata: { notificationId: id },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("deleteNotification error:", err);
    await logError({ req, error: err, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
