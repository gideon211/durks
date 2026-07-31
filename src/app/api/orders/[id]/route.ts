import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { verifyAuth, type AuthUser } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
    const { id } = await params;
    await connectDB();

    const order = await Order.findById(id).populate("userId", "email name fullName").lean();
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Check authorization (owner or admin)
    const orderUserId = (order.userId as unknown as { _id: string })?._id?.toString() || (order.userId as unknown as string)?.toString();
    if (orderUserId !== authUser.id && !authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Not authorized to view this order" }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    console.error("Get order by ID error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch order" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let authUser: AuthUser | null = null;
  try {
    try {
      authUser = verifyAuth(req);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "delete_order",
      details: `Deleted order ${order.orderNumber || id}`,
      metadata: { orderId: id, orderNumber: order.orderNumber, totalAmount: order.totalAmount },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Order deleted permanently" });
  } catch (error: unknown) {
    console.error("Delete order error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to delete order" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let authUser: AuthUser | null = null;
  try {
    try {
      authUser = verifyAuth(req);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { orderStatus } = await req.json();

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "completed", "cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ success: false, message: "Invalid order status", validStatuses }, { status: 400 });
    }

    await connectDB();

    const before = await Order.findById(id).lean();
    if (!before) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true }).populate("userId", "email name fullName");
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "update_order_status",
      details: `Order ${order.orderNumber || id} status: ${(before as { orderStatus?: string }).orderStatus} → ${orderStatus}`,
      metadata: { orderId: id, orderNumber: order.orderNumber, from: (before as { orderStatus?: string }).orderStatus, to: orderStatus },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Order status updated successfully", order });
  } catch (error: unknown) {
    console.error("Update order status error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to update order status" }, { status: 500 });
  }
}
