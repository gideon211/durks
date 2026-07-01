import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    await connectDB();
    const actions = await ActivityLog.distinct("action");
    return NextResponse.json({ success: true, actions });
  } catch (error: unknown) {
    console.error("Activity actions error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
