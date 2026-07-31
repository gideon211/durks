import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import Cart from "@/models/cart";
import { sendEmail } from "@/lib/email";
import { logActivity } from "@/lib/activityLogger";
import { createNotification } from "@/lib/notifier";

const verifyPaystackSignature = (body: string, signature: string | null) => {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");
  return hash === signature;
};

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!verifyPaystackSignature(rawBody, signature)) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { event, data } = body;

    if (event !== "charge.success") {
      return new NextResponse("Event ignored", { status: 200 });
    }

    await connectDB();

    const { reference, metadata = {}, amount: paystackAmount } = data;
    const { userId, customer, items, deliveryDate, deliveryTime, calculatedTotal } = metadata;

    if (!items || items.length === 0 || !customer?.email) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    // Normalize items
    let totalAmount = 0;
    let totalQty = 0;
    const normalizedItems = items
      .filter((item: { drinkId?: string }) => item && item.drinkId)
      .map((item: { price?: number; quantity?: number; drinkId: string; name: string; pack: string; image: string }) => {
        const price = Number(item.price || 0);
        const quantity = Math.max(1, Number(item.quantity || 1));
        totalAmount += price * quantity;
        totalQty += quantity;
        return {
          drinkId: item.drinkId,
          name: item.name || "Item",
          pack: item.pack || "",
          price,
          quantity,
          image: item.image || "",
        };
      });

    if (normalizedItems.length === 0) {
      return new NextResponse("No valid items", { status: 400 });
    }

    // Create order (atomic to prevent duplicates)
    const order = await Order.findOneAndUpdate(
      { paystackReference: reference },
      {
        $setOnInsert: {
          userId: userId || null,
          customer,
          items: normalizedItems,
          totalAmount,
          totalItems: totalQty,
          deliveryDate: deliveryDate || null,
          deliveryTime: deliveryTime || null,
          paystackReference: reference,
          paymentStatus: "paid",
          orderStatus: "confirmed",
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const isNewOrder = order.createdAt > new Date(Date.now() - 10000);
    if (!isNewOrder) {
      return new NextResponse("Order already processed", { status: 200 });
    }

    await logActivity({
      user: userId || null,
      email: customer.email,
      action: "order_placed",
      details: `Order placed — GH₵ ${totalAmount.toFixed(2)}`,
      metadata: { orderId: order._id, totalAmount, reference },
      ip: req.headers.get("x-forwarded-for") || req.ip || null,
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    // Send emails (async)
    Promise.all([
      sendCustomerEmail(order, customer, normalizedItems, totalAmount),
      sendAdminEmail(order, customer, normalizedItems, totalAmount),
    ]).catch((err) => console.error("Email error:", err));

    createNotification({
      type: "new_order",
      title: "New Order Received",
      message: `${customer.fullName || customer.email} placed an order — GH₵ ${totalAmount.toFixed(2)}`,
      link: "/admin/orders",
      metadata: { orderId: order._id, totalAmount, email: customer.email },
    });

    // Clear cart
    if (userId) {
      try {
        await Cart.deleteMany({ userId });
      } catch (err) {
        console.warn("Failed to clear cart:", err);
      }
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}

async function sendCustomerEmail(order: { _id: string }, customer: { fullName: string; email: string }, items: Array<{ quantity: number; name: string; pack: string; price: number }>, totalAmount: number) {
  const itemsHTML = items
    .map((it) => `<li>${it.quantity} × ${it.name} ${it.pack ? `(${it.pack})` : ""} — ₵${it.price.toFixed(2)}</li>`)
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f5132; color: #fff; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Order Confirmed</h2>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hi ${customer.fullName},</p>
        <p>Thank you for your order! Your payment has been confirmed.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
        </div>
        <h3>Order Summary:</h3>
        <ul style="padding-left: 20px;">${itemsHTML}</ul>
        <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #0f5132;">
          <p style="margin: 0; font-size: 20px; font-weight: bold;">Total: ₵${totalAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({ to: customer.email, subject: `Order Confirmed - ${order._id}`, html });
}

async function sendAdminEmail(order: { _id: string; totalItems?: number }, customer: { fullName: string; email: string; phone: string; address: string; city: string }, items: Array<{ name: string; pack: string; quantity: number; price: number }>, totalAmount: number) {
  if (!process.env.ADMIN_EMAIL) return;

  const itemsRows = items
    .map((it) => `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${it.name}</strong>${it.pack ? `<br><small>Pack: ${it.pack}</small>` : ""}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${it.quantity}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₵${it.price.toFixed(2)}</td></tr>`)
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <div style="background: #0f5132; color: #fff; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">New Order Received</h2>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p><strong>Customer:</strong> ${customer.fullName} (${customer.email})</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
        <p><strong>Address:</strong> ${customer.address}, ${customer.city}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead><tr style="background: #f5f5f5;"><th style="padding: 8px; border: 1px solid #ddd;">Product</th><th style="padding: 8px; border: 1px solid #ddd;">Qty</th><th style="padding: 8px; border: 1px solid #ddd;">Price</th></tr></thead>
          <tbody>${itemsRows}</tbody>
        </table>
        <p style="font-size: 20px; font-weight: bold; color: #0f5132;">Total: ₵${totalAmount.toFixed(2)}</p>
      </div>
    </div>
  `;

  await sendEmail({ to: process.env.ADMIN_EMAIL, subject: `New Order — ₵${totalAmount.toFixed(2)}`, html });
}
