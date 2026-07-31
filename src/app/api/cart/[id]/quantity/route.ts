import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cart from "@/models/cart";
import { verifyAuth } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
    const { id } = await params;
    let { quantity } = await req.json();
    quantity = Number(quantity);

    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json({ message: "Quantity must be at least 1" }, { status: 400 });
    }

    await connectDB();

    const cartItem = await Cart.findOneAndUpdate(
      { _id: id, userId: authUser.id },
      { $set: { quantity } },
      { new: true }
    );

    if (!cartItem) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "update_cart_quantity",
      details: `Updated cart item quantity to ${quantity}`,
      metadata: { cartItemId: id, quantity, drinkId: cartItem.drinkId },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ message: "Quantity updated", cartItem });
  } catch (err) {
    console.error("Update cart item quantity error:", err);
    await logError({ req, error: err, status: 500 });
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
