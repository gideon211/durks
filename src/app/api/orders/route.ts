import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    await connectDB();

    const orders = await Order.find({ userId: authUser.id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: unknown) {
    console.error("Get user orders error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { customer, items, totalAmount, paystackReference, deliveryDate, deliveryTime } = body;

    // For pay-on-delivery orders (no paystack reference)
    if (!paystackReference) {
      const reference = "COD-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      const order = await Order.create({
        userId: body.userId || null,
        customer,
        items,
        totalAmount,
        totalItems: items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
        deliveryDate: deliveryDate || null,
        deliveryTime: deliveryTime || null,
        paystackReference: reference,
        paymentStatus: "pending",
        orderStatus: "confirmed",
      });

      return NextResponse.json({ success: true, order }, { status: 201 });
    }

    return NextResponse.json({ success: false, message: "Use payments/initialize for card payments" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Create order error:", error);
    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
  }
}
