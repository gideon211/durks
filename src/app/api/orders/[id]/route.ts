import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { verifyAuth } from "@/lib/auth";

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
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Order deleted permanently" });
  } catch (error: unknown) {
    console.error("Delete order error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete order" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { orderStatus } = await req.json();

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "completed", "cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ success: false, message: "Invalid order status", validStatuses }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true }).populate("userId", "email name fullName");
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order status updated successfully", order });
  } catch (error: unknown) {
    console.error("Update order status error:", error);
    return NextResponse.json({ success: false, message: "Failed to update order status" }, { status: 500 });
  }
}
