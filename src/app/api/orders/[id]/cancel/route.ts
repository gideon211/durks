import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
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

    order.orderStatus = "cancelled";
    order.paymentStatus = order.paymentStatus === "paid" ? "refunded" : "cancelled";
    await order.save();

    return NextResponse.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error: unknown) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ success: false, message: "Failed to cancel order" }, { status: 500 });
  }
}
