import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import connectDB from "@/lib/mongodb";
import Cart from "@/models/cart";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    await connectDB();

    const {
      email: checkoutEmail,
      phone,
      fullName,
      address,
      city = "",
      country = "Ghana",
      deliveryDate = null,
      deliveryTime = null,
    } = await req.json();

    const customer = {
      fullName: fullName || "",
      email: checkoutEmail || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      country: country || "Ghana",
    };

    // Validate customer
    if (!customer.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ success: false, message: "Valid email is required" }, { status: 400 });
    }
    if (!customer.phone || customer.phone.length < 10) {
      return NextResponse.json({ success: false, message: "Valid phone number is required" }, { status: 400 });
    }

    // Get cart items
    const cartItems = await Cart.find({ userId: authUser.id }).populate({ path: "drinkId", strictPopulate: false });
    if (!cartItems?.length) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    // Build items array with server-side prices
    const items = [];
    let total = 0;

    for (const item of cartItems) {
      if (!item.drinkId) continue;

      const drink = item.drinkId as unknown as { packs: Array<{ pack: number; price: number }>; imageUrl?: string; image?: string; name: string; _id: string };
      let price = item.price;
      if (!price) {
        const packs = drink.packs || [];
        const selectedPack = packs.find((p) => String(p.pack) === String(item.pack));
        price = selectedPack?.price || packs[0]?.price || 0;
      }

      const quantity = Math.max(1, Number(item.quantity || 1));
      const subtotal = price * quantity;
      total += subtotal;

      items.push({
        drinkId: drink._id,
        name: drink.name,
        price,
        quantity,
        pack: item.pack,
        image: drink.imageUrl || drink.image || "",
      });
    }

    if (items.length === 0) {
      return NextResponse.json({ success: false, message: "No valid items in cart" }, { status: 400 });
    }

    const amount = Math.round(total * 100);

    const metadata = {
      userId: authUser.id,
      customer,
      items,
      deliveryDate,
      deliveryTime,
      calculatedTotal: total,
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: customer.email,
        amount,
        currency: "GHS",
        callback_url: `${process.env.FRONTEND_URL}/orders`,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (error: unknown) {
    console.error("Payment initialization error:", error);
    return NextResponse.json({
      success: false,
      message: "Payment initialization failed. Please try again.",
    }, { status: 500 });
  }
}
