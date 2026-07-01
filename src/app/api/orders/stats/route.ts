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

    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ["pending", "confirmed"] },
    });

    const stats = {
      totalOrders,
      totalRevenue,
      recentOrders,
      pendingOrders,
      ordersByStatus: ordersByStatus.reduce((acc: Record<string, number>, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    return NextResponse.json({ success: true, stats });
  } catch (error: unknown) {
    console.error("Get order stats error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch statistics" }, { status: 500 });
  }
}
