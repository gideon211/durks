import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cart from "@/models/cart";
import { verifyAuth } from "@/lib/auth";
import { logActivity } from "@/lib/activityLogger";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
    const { id } = await params;
    let { pack } = await req.json();
    pack = Number(pack);

    if (isNaN(pack)) {
      return NextResponse.json({ message: "Invalid pack value" }, { status: 400 });
    }

    await connectDB();

    const cartItem = await Cart.findById(id);
    if (!cartItem) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }

    // Merge with existing cart item if same drinkId and pack exists
    const existingItem = await Cart.findOne({ userId: authUser.id, drinkId: cartItem.drinkId, pack });
    if (existingItem) {
      existingItem.quantity += cartItem.quantity;
      await existingItem.save();
      await cartItem.deleteOne();

      logActivity({
        user: authUser.id,
        email: null,
        action: "update_cart_pack",
        details: `Changed pack to ${pack} (merged with existing)`,
        metadata: { cartItemId: id, pack, drinkId: cartItem.drinkId },
        isAdmin: authUser.isAdmin,
      });

      return NextResponse.json({ message: "Pack updated (merged with existing item)", cartItem: existingItem });
    }

    cartItem.pack = pack;
    await cartItem.save();

    logActivity({
      user: authUser.id,
      email: null,
      action: "update_cart_pack",
      details: `Changed pack to ${pack}`,
      metadata: { cartItemId: id, pack, drinkId: cartItem.drinkId },
      isAdmin: authUser.isAdmin,
    });

    return NextResponse.json({ message: "Pack updated", cartItem });
  } catch (err) {
    console.error("Update cart item pack error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
