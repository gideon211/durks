import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cart from "@/models/cart";
import { verifyAuth } from "@/lib/auth";
import { logActivity } from "@/lib/activityLogger";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
    const { id } = await params;
    await connectDB();

    const deletedItem = await Cart.findOneAndDelete({ _id: id, userId: authUser.id });
    if (!deletedItem) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }

    logActivity({
      user: authUser.id,
      email: null,
      action: "remove_from_cart",
      details: "Removed item from cart",
      metadata: { cartItemId: id, drinkId: deletedItem.drinkId, pack: deletedItem.pack },
      isAdmin: authUser.isAdmin,
    });

    return NextResponse.json({ message: "Item removed from cart", deletedItem });
  } catch (err) {
    console.error("Remove from cart error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
    const { id } = await params;
    const updates = await req.json();
    await connectDB();

    const cartItem = await Cart.findOneAndUpdate(
      { _id: id, userId: authUser.id },
      { $set: updates },
      { new: true }
    );

    if (!cartItem) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cart item updated", cartItem });
  } catch (err) {
    console.error("Update cart item error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
