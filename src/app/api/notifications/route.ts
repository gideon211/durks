import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET(req: NextRequest) {
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
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    await connectDB();
    await Notification.findByIdAndUpdate(id, { read: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await connectDB();
    await Notification.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("deleteNotification error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
