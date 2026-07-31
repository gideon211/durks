import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { verifyAuth, type AuthUser } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let authUser: AuthUser | null = null;
  try {
    try {
      authUser = verifyAuth(req);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const order = await Order.findById(id).populate("userId", "email name fullName");
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const orderUserId = (order.userId as unknown as { _id: string })?._id?.toString() || (order.userId as unknown as string)?.toString();
    if (orderUserId !== authUser.id && !authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Not authorized to cancel this order" }, { status: 403 });
    }

    const nonCancellableStatuses = ["shipped", "delivered", "completed"];
    if (nonCancellableStatuses.includes(order.orderStatus)) {
      return NextResponse.json({ success: false, message: `Cannot cancel order with status: ${order.orderStatus}` }, { status: 400 });
    }

    const fromStatus = order.orderStatus;
    const fromPayment = order.paymentStatus;
    order.orderStatus = "cancelled";
    order.paymentStatus = order.paymentStatus === "paid" ? "refunded" : "cancelled";
    await order.save();

    await logActivity({
      ...buildActor(req, authUser),
      action: "cancel_order",
      details: `Cancelled order ${order.orderNumber || id}`,
      metadata: {
        orderId: id,
        orderNumber: order.orderNumber,
        orderStatus: { from: fromStatus, to: order.orderStatus },
        paymentStatus: { from: fromPayment, to: order.paymentStatus },
      },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error: unknown) {
    console.error("Cancel order error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to cancel order" }, { status: 500 });
  }
}
