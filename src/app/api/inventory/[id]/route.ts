import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/inventory";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const before = await Inventory.findById(id).lean();
    if (!before) {
      return NextResponse.json({ success: false, message: "Inventory item not found" }, { status: 404 });
    }

    const item = await Inventory.findByIdAndUpdate(id, body, { new: true });
    if (!item) {
      return NextResponse.json({ success: false, message: "Inventory item not found" }, { status: 404 });
    }

    const changedFields: Record<string, { from: unknown; to: unknown }> = {};
    for (const key of Object.keys(body)) {
      if (JSON.stringify((before as Record<string, unknown>)[key]) !== JSON.stringify(body[key])) {
        changedFields[key] = { from: (before as Record<string, unknown>)[key], to: body[key] };
      }
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "update_inventory",
      details: `Updated inventory item "${item.product || item.sku}"`,
      metadata: { itemId: id, changed: changedFields },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, item });
  } catch (error: unknown) {
    console.error("Error updating inventory item:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to update inventory item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { id } = await params;
    await connectDB();
    const item = await Inventory.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ success: false, message: "Inventory item not found" }, { status: 404 });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "delete_inventory",
      details: `Deleted inventory item "${item.product || item.sku}"`,
      metadata: { itemId: id, product: item.product, sku: item.sku },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Inventory item deleted" });
  } catch (error: unknown) {
    console.error("Error deleting inventory item:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to delete inventory item" }, { status: 500 });
  }
}
