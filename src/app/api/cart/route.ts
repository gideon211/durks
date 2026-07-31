import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cart from "@/models/cart";
import Drink from "@/models/drinks";
import { verifyAuth } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    await connectDB();

    const cartItems = await Cart.find({ userId: authUser.id }).populate("drinkId");

    const result = cartItems.map((item) => ({
      id: item._id,
      drinkId: (item.drinkId as unknown as { _id: string })._id,
      name: (item.drinkId as unknown as { name: string }).name,
      price: (item.drinkId as unknown as { packs: Array<{ pack: number; price: number }> }).packs?.find(
        (p: { pack: number }) => p.pack === item.pack
      )?.price || 0,
      qty: item.quantity,
      packs: (item.drinkId as unknown as { packs: unknown }).packs,
      pack: item.pack,
      image: (item.drinkId as unknown as { imageUrl: string }).imageUrl || "",
    }));

    return NextResponse.json({ cartItems: result });
  } catch (err) {
    console.error("Get cart items error:", err);
    await logError({ req, error: err, status: 500 });
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    await connectDB();

    let { drinkId, quantity = 1, pack } = await req.json();
    quantity = Number(quantity);

    const drink = await Drink.findById(drinkId);
    if (!drink) {
      return NextResponse.json({ message: "Drink not found" }, { status: 404 });
    }

    if (!pack) {
      pack = drink.packs?.[0]?.pack;
    }
    pack = Number(pack);

    if (!drinkId || isNaN(pack) || quantity < 1) {
      return NextResponse.json({ message: "Invalid drink, pack, or quantity" }, { status: 400 });
    }

    const cartItem = await Cart.findOneAndUpdate(
      { userId: authUser.id, drinkId, pack },
      { $inc: { quantity } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await logActivity({
      ...buildActor(req, authUser),
      action: "add_to_cart",
      details: `Added ${drink.name} (pack ${pack}) × ${quantity} to cart`,
      metadata: { drinkId, pack, quantity, cartItemId: cartItem._id },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ message: "Added to cart", cartItem }, { status: 201 });
  } catch (err) {
    console.error("Add to cart error:", err);
    await logError({ req, error: err, status: 500 });
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    await connectDB();

    const result = await Cart.deleteMany({ userId: authUser.id });

    await logActivity({
      ...buildActor(req, authUser),
      action: "clear_cart",
      details: `Cleared cart (${result.deletedCount} items)`,
      metadata: { removed: result.deletedCount },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    await logError({ req, error: err, status: 500 });
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
