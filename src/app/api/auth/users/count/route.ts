import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    await connectDB();
    const count = await User.countDocuments();
    return NextResponse.json({ success: true, count });
  } catch (error: unknown) {
    console.error("User count error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
