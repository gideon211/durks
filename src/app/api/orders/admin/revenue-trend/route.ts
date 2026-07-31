import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {
    await connectDB();

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 29);

    const rows = await Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const byDate = new Map(
      rows.map((r: { _id: string; revenue: number; orders: number }) => [r._id, { revenue: r.revenue, orders: r.orders }])
    );

    const trend: Array<{ date: string; revenue: number; orders: number }> = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const entry = byDate.get(key);
      trend.push({ date: key, revenue: entry?.revenue ?? 0, orders: entry?.orders ?? 0 });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_revenue_trend",
      details: "Admin fetched revenue trend",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, trend });
  } catch (error: unknown) {
    console.error("Admin revenue trend error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
