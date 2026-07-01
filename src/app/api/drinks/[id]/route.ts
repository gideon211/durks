import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Drink from "@/models/drinks";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const drink = await Drink.findById(id);
    if (!drink) {
      return NextResponse.json({ success: false, message: "Drink not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, drink });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error fetching drink:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const updates = await req.json();

    if (updates.status) {
      updates.status = updates.status.toLowerCase();
    }

    if (updates.packs && typeof updates.packs === "string") {
      try {
        updates.packs = JSON.parse(updates.packs);
      } catch {
        // keep as-is
      }
    }

    if (Array.isArray(updates.packs)) {
      for (const pack of updates.packs) {
        if (pack.oldPrice !== undefined && pack.oldPrice !== null && pack.oldPrice !== "") {
          pack.oldPrice = parseFloat(pack.oldPrice);
          if (isNaN(pack.oldPrice) || pack.oldPrice < 0) {
            return NextResponse.json({ success: false, message: "Old price must be a valid positive number" }, { status: 400 });
          }
        } else {
          pack.oldPrice = null;
        }
      }
    }

    const updatedDrink = await Drink.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedDrink) {
      return NextResponse.json({ success: false, message: "Drink not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Drink updated successfully", drink: updatedDrink });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error updating drink:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const deletedDrink = await Drink.findByIdAndDelete(id);
    if (!deletedDrink) {
      return NextResponse.json({ success: false, message: "Drink not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Drink deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error deleting drink:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
