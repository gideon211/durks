import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

const PROJECTION = {
  orderNumber: 1,
  customer: 1,
  userId: 1,
  totalAmount: 1,
  paymentStatus: 1,
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

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "50", 10) || 50));
    const payment = sp.get("payment") || "all";
    const search = sp.get("search")?.trim() || "";

    const filter: Record<string, unknown> = {};
    if (payment !== "all") filter.paymentStatus = payment;
    if (search) {
      filter.$or = [
        { "customer.fullName": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
        { paystackReference: { $regex: search, $options: "i" } },
      ];
    }

    const [total, docs] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter, PROJECTION)
        .sort({ createdAt: -1 })
        .populate("userId", "email username")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const payments = docs.map((o) => {
      const reference = String(o.paystackReference || "");
      return {
        _id: o._id,
        orderNumber: o.orderNumber ?? null,
        customer: o.customer,
        userId: o.userId,
        totalAmount: o.totalAmount,
        paymentStatus: o.paymentStatus,
        paystackReference: reference,
        paymentMethod:
          o.paymentMethod ||
          (reference.startsWith("COD-") ? "Cash on Delivery" : "Card"),
        createdAt: o.createdAt,
      };
    });

    void logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_payments",
      details: "Admin fetched payments summary",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({
      success: true,
      payments,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error: unknown) {
    console.error("Admin payments error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
