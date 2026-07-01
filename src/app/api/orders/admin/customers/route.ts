import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import User from "@/models/user";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    await connectDB();

    const customers = await Order.aggregate([
      { $group: { _id: "$userId", totalOrders: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" }, lastOrder: { $max: "$createdAt" } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { email: "$user.email", username: "$user.username", totalOrders: 1, totalSpent: 1, lastOrder: 1 } },
      { $sort: { totalSpent: -1 } },
    ]);

    return NextResponse.json({ success: true, count: customers.length, customers });
  } catch (error: unknown) {
    console.error("Admin customers error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
