import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import "@/models/user";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

const PROJECTION = {
  orderNumber: 1,
  customer: 1,
  items: 1,
  totalAmount: 1,
  totalItems: 1,
  paymentStatus: 1,
  orderStatus: 1,
  paystackReference: 1,
  paymentMethod: 1,
  deliveryDate: 1,
  deliveryTime: 1,
  createdAt: 1,
  userId: 1,
};

function dateRangeFilter(dateRange: string): Record<string, unknown> | null {
  const now = new Date();
  if (dateRange === "recent") return { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
  if (dateRange === "month") return { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
  if (dateRange === "quarter") return { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 2, 1) } };
  return null;
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {
    await connectDB();

    const sp = req.nextUrl.searchParams;
    const status = sp.get("status") || "all";
    const payment = sp.get("payment") || "all";
    const search = sp.get("search")?.trim() || "";
    const dateRange = sp.get("dateRange") || "all";
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "50", 10) || 50));

    const filter: Record<string, unknown> = {};
    if (status !== "all") filter.orderStatus = status;
    if (payment !== "all") filter.paymentStatus = payment;
    const range = dateRangeFilter(dateRange);
    if (range) Object.assign(filter, range);
    if (search) {
      filter.$or = [
        { "customer.fullName": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
        { paystackReference: { $regex: search, $options: "i" } },
      ];
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter, PROJECTION)
        .sort({ createdAt: -1 })
        .populate("userId", "email username")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    void logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_orders",
      details: "Admin fetched all orders",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      orders,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("No token") || msg.includes("Invalid or expired")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin get all orders error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
