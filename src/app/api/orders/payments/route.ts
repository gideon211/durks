import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const payments = await Order.find({ paymentStatus: { $ne: "pending" } })
      .sort({ createdAt: -1 })
      .populate("userId", "email username")
      .lean();

    return NextResponse.json({ success: true, payments });
  } catch (error: unknown) {
    console.error("Get payments list error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch payments" }, { status: 500 });
  }
}
