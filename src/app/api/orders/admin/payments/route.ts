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

    const payments = await Order.aggregate([
      { $group: { _id: "$paymentStatus", count: { $sum: 1 }, total: { $sum: "$totalAmount" } } },
    ]);

    return NextResponse.json({ success: true, payments });
  } catch (error: unknown) {
    console.error("Admin payments error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
