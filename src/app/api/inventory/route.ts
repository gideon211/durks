import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/inventory";
import { verifyAuth, type AuthUser } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET() {
  try {
    await connectDB();
    const items = await Inventory.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, inventory: items });
  } catch (error: unknown) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let authUser: AuthUser | null = null;
  try {
    try {
      authUser = verifyAuth(req);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const item = await Inventory.create(body);

    await logActivity({
      ...buildActor(req, authUser),
      action: "create_inventory",
      details: `Created inventory item "${item.product || item.sku}"`,
      metadata: { itemId: item._id.toString(), product: item.product, sku: item.sku, stock: item.stock },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating inventory item:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to create inventory item" }, { status: 500 });
  }
}
