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

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "email username")
      .lean();

    const payments = orders.map((o) => {
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

    await logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_payments",
      details: "Admin fetched payments summary",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, payments });
  } catch (error: unknown) {
    console.error("Admin payments error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
