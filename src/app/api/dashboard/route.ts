import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import User from "@/models/user";
import Drink from "@/models/drinks";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      ordersThisMonth,
      ordersThisWeek,
      recentOrders,
      pendingOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]).then((r) => r[0]?.total || 0),
      User.countDocuments(),
      Drink.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Order.countDocuments({ orderStatus: { $in: ["pending", "confirmed"] } }),
    ]);

    await logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_dashboard",
      details: "Admin fetched dashboard data",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({
      success: true,
      dashboard: {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        ordersThisMonth,
        ordersThisWeek,
        recentOrders,
        pendingOrders,
      },
    });
  } catch (error: unknown) {
    console.error("getDashboard error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
