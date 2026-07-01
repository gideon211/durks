import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import Order from "@/models/order";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    const { emails } = await req.json();
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ success: false, message: "No emails provided" }, { status: 400 });
    }
    await connectDB();
    const users = await User.find({ email: { $in: emails } });
    const userIds = users.map((u) => u._id);
    await User.deleteMany({ _id: { $in: userIds } });
    await Order.deleteMany({ userId: { $in: userIds } });
    return NextResponse.json({ success: true, message: `${emails.length} customers deleted` });
  } catch (error: unknown) {
    console.error("Admin batch delete customers error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
