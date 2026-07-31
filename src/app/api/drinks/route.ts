import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Drink from "@/models/drinks";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET() {
  try {
    await connectDB();
    const drinks = await Drink.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: drinks.length, drinks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error fetching drinks:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    await connectDB();
    const body = await req.json();
    const { name, description, category, size, status, packs, imageUrl } = body;

    if (!name || !packs) {
      return NextResponse.json({ success: false, message: "Name and at least one pack are required" }, { status: 400 });
    }

    let parsedPacks = [];
    if (packs) {
      try {
        parsedPacks = typeof packs === "string" ? JSON.parse(packs) : packs;
      } catch {
        return NextResponse.json({ success: false, message: "Invalid packs format" }, { status: 400 });
      }
    }

    if (!Array.isArray(parsedPacks) || parsedPacks.length === 0) {
      return NextResponse.json({ success: false, message: "At least one pack with pack size and price is required" }, { status: 400 });
    }

    for (const pack of parsedPacks) {
      if (!pack.pack || !pack.price) {
        return NextResponse.json({ success: false, message: "Each pack must have both pack size and price" }, { status: 400 });
      }
      if (pack.oldPrice !== undefined && pack.oldPrice !== null && pack.oldPrice !== "") {
        pack.oldPrice = parseFloat(pack.oldPrice);
        if (isNaN(pack.oldPrice) || pack.oldPrice < 0) {
          return NextResponse.json({ success: false, message: "Old price must be a valid positive number" }, { status: 400 });
        }
      } else {
        pack.oldPrice = null;
      }
    }

    const drinkStatus = status ? status.toLowerCase() : "active";

    const newDrink = new Drink({
      name,
      description: description || "",
      category: category || "",
      size: size || "",
      status: drinkStatus,
      available: true,
      imageUrl: imageUrl || "",
      packs: parsedPacks,
    });

    const savedDrink = await newDrink.save();

    await logActivity({
      ...buildActor(req, authUser),
      action: "create_drink",
      details: `Created drink "${savedDrink.name}"${savedDrink.category ? ` (${savedDrink.category})` : ""}`,
      metadata: { drinkId: savedDrink._id.toString(), name: savedDrink.name, category: savedDrink.category, status: savedDrink.status, packs: parsedPacks },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Drink added successfully", drink: savedDrink }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error adding drink:", error);
    await logError({ req, error, status: 500, actor: authUser, metadata: { message } });
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
