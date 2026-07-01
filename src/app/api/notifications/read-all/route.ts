import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function PATCH() {
  try {
    await connectDB();
    await Notification.updateMany({ read: false }, { read: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
