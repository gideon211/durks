import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { verifyAuth, type AuthUser } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

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
  let authUser: AuthUser | null = null;
  try {
    try {
      authUser = verifyAuth(req);
    } catch {
      // Guest checkout allowed — actor attribution falls back to stored email.
    }

    await connectDB();
    const body = await req.json();
    const { customer, items, totalAmount, paystackReference, deliveryDate, deliveryTime } = body;

    // For pay-on-delivery orders (no paystack reference)
    if (!paystackReference) {
      const reference = "COD-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      const order = await Order.create({
        userId: authUser?.id ?? body.userId ?? null,
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

      await logActivity({
        ...buildActor(req, authUser),
        email: authUser?.email ?? customer?.email ?? null,
        action: "order_created",
        details: `COD order created by ${customer?.email || "guest"} — GH₵ ${totalAmount}`,
        metadata: { orderId: order._id.toString(), reference, totalAmount, totalItems: order.totalItems, orderStatus: "confirmed", paymentStatus: "pending" },
        route: req.nextUrl?.pathname ?? null,
        method: req.method ?? null,
      });

      return NextResponse.json({ success: true, order }, { status: 201 });
    }

    return NextResponse.json({ success: false, message: "Use payments/initialize for card payments" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Create order error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
  }
}
