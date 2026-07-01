import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/inventory";
import { verifyAuth } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const item = await Inventory.findByIdAndUpdate(id, body, { new: true });
    if (!item) {
      return NextResponse.json({ success: false, message: "Inventory item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, item });
  } catch (error: unknown) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json({ success: false, message: "Failed to update inventory item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();
    await Inventory.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Inventory item deleted" });
  } catch (error: unknown) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json({ success: false, message: "Failed to delete inventory item" }, { status: 500 });
  }
}
