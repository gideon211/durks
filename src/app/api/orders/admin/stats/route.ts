import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import Preorder from "@/models/preorder";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {
    await connectDB();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalRevenueAgg,
      paidOrders,
      ordersToday,
      revenueTodayAgg,
      ordersThisMonth,
      revenueThisMonthAgg,
      ordersThisWeek,
      revenueThisWeekAgg,
      pendingOrders,
      statusCounts,
      customerAgg,
      preorderCount,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: weekStart } }),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: weekStart } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ orderStatus: { $in: ["pending", "confirmed"] } }),
      Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $group: { _id: "$customer.email", orderCount: { $sum: 1 } } },
        {
          $group: {
            _id: null,
            distinctCustomers: { $sum: 1 },
            repeatCustomers: {
              $sum: { $cond: [{ $gte: ["$orderCount", 2] }, 1, 0] },
            },
          },
        },
      ]),
      Preorder.countDocuments(),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const revenueToday = revenueTodayAgg[0]?.total || 0;
    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
    const revenueThisWeek = revenueThisWeekAgg[0]?.total || 0;

    const customerSummary = customerAgg[0];
    const distinctCustomers = customerSummary?.distinctCustomers || 0;
    const repeatCustomers = customerSummary?.repeatCustomers || 0;

    void logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_order_stats",
      details: "Admin fetched order statistics",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        paidOrders,
        ordersToday,
        revenueToday,
        ordersThisMonth,
        revenueThisMonth,
        ordersThisWeek,
        revenueThisWeek,
        pendingOrders,
        statusBreakdown: statusCounts.reduce((acc: Record<string, number>, s: { _id: string; count: number }) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
        repeatPurchaseRate: distinctCustomers > 0 ? repeatCustomers / distinctCustomers : 0,
        customerLifetimeValue: distinctCustomers > 0 ? totalRevenue / distinctCustomers : 0,
        preorderCount,
        preorderRatio: totalOrders > 0 ? preorderCount / totalOrders : 0,
      },
    });
  } catch (error: unknown) {
    console.error("Admin orders stats error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
