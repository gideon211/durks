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

    const customers = await Order.aggregate([
      {
        $group: {
          _id: { $toLower: "$customer.email" },
          fullName: { $first: "$customer.fullName" },
          email: { $first: { $toLower: "$customer.email" } },
          phone: { $first: "$customer.phone" },
          city: { $first: "$customer.city" },
          orders: { $sum: 1 },
          totalSpent: { $sum: { $ifNull: ["$totalAmount", 0] } },
        },
      },
      { $match: { email: { $ne: null } } },
      { $sort: { orders: -1 } },
    ]);

    return NextResponse.json({ success: true, customers });
  } catch (error: unknown) {
    console.error("Get customers error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch customers" }, { status: 500 });
  }
}
