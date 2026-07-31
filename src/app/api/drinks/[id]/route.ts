import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Drink from "@/models/drinks";
import { verifyAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

const VALID_STATUSES = ["active", "inactive", "few packs left", "out of stock"];

function parsePacks(raw: FormDataEntryValue | null): { packs?: unknown[]; error?: string } {
  if (raw === null) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(raw));
  } catch {
    return { error: "Invalid packs format" };
  }

  if (!Array.isArray(parsed)) {
    return { error: "Packs must be an array" };
  }

  for (const pack of parsed as Array<Record<string, unknown>>) {
    if (pack.pack === undefined || pack.pack === "" || pack.price === undefined || pack.price === "") {
      return { error: "Each pack must have both pack size and price" };
    }
    pack.pack = parseFloat(String(pack.pack));
    pack.price = parseFloat(String(pack.price));
    if (isNaN(pack.pack as number) || (pack.pack as number) <= 0 || isNaN(pack.price as number) || (pack.price as number) < 0) {
      return { error: "Pack size and price must be valid positive numbers" };
    }
    if (pack.oldPrice !== undefined && pack.oldPrice !== null && pack.oldPrice !== "") {
      pack.oldPrice = parseFloat(String(pack.oldPrice));
      if (isNaN(pack.oldPrice as number) || (pack.oldPrice as number) < 0) {
        return { error: "Old price must be a valid positive number" };
      }
    } else {
      pack.oldPrice = null;
    }
  }

  return { packs: parsed };
}

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
    let authUser;
    try {
      authUser = verifyAuth(req);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const fd = await req.formData();
    const updates: Record<string, unknown> = {};

    const name = fd.get("name");
    const description = fd.get("description");
    const category = fd.get("category");
    const size = fd.get("size");
    const status = fd.get("status");
    const imageFile = fd.get("image");

    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }
    if (description !== null) updates.description = String(description);
    if (category !== null) updates.category = String(category);
    if (size !== null) updates.size = String(size);
    if (status !== null) {
      const drinkStatus = String(status).toLowerCase();
      if (!VALID_STATUSES.includes(drinkStatus)) {
        return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
      }
      updates.status = drinkStatus;
    }

    const { packs, error } = parsePacks(fd.get("packs"));
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }
    if (packs) {
      updates.packs = packs;
    }

    if (imageFile instanceof File && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      updates.imageUrl = await uploadImage(buffer, `drink-${Date.now()}`);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "No valid fields to update" }, { status: 400 });
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
    let authUser;
    try {
      authUser = verifyAuth(req);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
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
