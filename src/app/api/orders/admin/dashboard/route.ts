import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import Preorder from "@/models/preorder";
import Drink from "@/models/drinks";
import "@/models/user";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

const RECENT_PROJECTION = {
  orderNumber: 1,
  customer: 1,
  items: 1,
  totalAmount: 1,
  totalItems: 1,
  paymentStatus: 1,
  orderStatus: 1,
  paystackReference: 1,
  paymentMethod: 1,
  createdAt: 1,
};

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
      trendRows,
      categoryAgg,
      productCount,
      customerCountAgg,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.aggregate([{ $match: { paymentStatus: "paid", createdAt: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      Order.aggregate([{ $match: { paymentStatus: "paid", createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.countDocuments({ createdAt: { $gte: weekStart } }),
      Order.aggregate([{ $match: { paymentStatus: "paid", createdAt: { $gte: weekStart } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.countDocuments({ orderStatus: { $in: ["pending", "confirmed"] } }),
      Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $group: { _id: "$customer.email", orderCount: { $sum: 1 } } },
        { $group: { _id: null, distinctCustomers: { $sum: 1 }, repeatCustomers: { $sum: { $cond: [{ $gte: ["$orderCount", 2] }, 1, 0] } } } },
      ]),
      Preorder.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0) - 29 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Drink.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Drink.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: "$customer.email" } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]),
      Order.find({}, RECENT_PROJECTION)
        .sort({ createdAt: -1 })
        .populate("userId", "email username")
        .limit(5)
        .lean(),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const revenueToday = revenueTodayAgg[0]?.total || 0;
    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
    const revenueThisWeek = revenueThisWeekAgg[0]?.total || 0;

    const customerSummary = customerAgg[0];
    const distinctCustomers = customerSummary?.distinctCustomers || 0;
    const repeatCustomers = customerSummary?.repeatCustomers || 0;

    // Fill the 30-day revenue trend (0 for empty days).
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 29);
    const byDate = new Map(trendRows.map((r: { _id: string; revenue: number; orders: number }) => [r._id, { revenue: r.revenue, orders: r.orders }]));
    const revenueTrend: Array<{ date: string; revenue: number; orders: number }> = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const entry = byDate.get(key);
      revenueTrend.push({ date: key, revenue: entry?.revenue ?? 0, orders: entry?.orders ?? 0 });
    }

    const categories = categoryAgg
      .filter((s: { _id: string }) => s._id)
      .map((s: { _id: string; count: number }) => ({ name: s._id, count: s.count }));

    void logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_dashboard",
      details: "Admin fetched dashboard overview",
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
      revenueTrend,
      categories,
      productCount,
      customerCount: customerCountAgg[0]?.count ?? 0,
      recentOrders,
    });
  } catch (error: unknown) {
    console.error("Admin dashboard error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
