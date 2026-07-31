import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Drink from "@/models/drinks";
import { verifyAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

const VALID_STATUSES = ["active", "inactive", "few packs left", "out of stock"];

function parsePacks(raw: FormDataEntryValue | null): { packs: unknown[]; error?: string } {
  if (!raw) {
    return { packs: [], error: "Name and packs required" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(raw));
  } catch {
    return { packs: [], error: "Invalid packs format" };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { packs: [], error: "At least one pack with pack size and price is required" };
  }

  for (const pack of parsed as Array<Record<string, unknown>>) {
    if (pack.pack === undefined || pack.pack === "" || pack.price === undefined || pack.price === "") {
      return { packs: [], error: "Each pack must have both pack size and price" };
    }
    pack.pack = parseFloat(String(pack.pack));
    pack.price = parseFloat(String(pack.price));
    if (isNaN(pack.pack as number) || (pack.pack as number) <= 0 || isNaN(pack.price as number) || (pack.price as number) < 0) {
      return { packs: [], error: "Pack size and price must be valid positive numbers" };
    }
    if (pack.oldPrice !== undefined && pack.oldPrice !== null && pack.oldPrice !== "") {
      pack.oldPrice = parseFloat(String(pack.oldPrice));
      if (isNaN(pack.oldPrice as number) || (pack.oldPrice as number) < 0) {
        return { packs: [], error: "Old price must be a valid positive number" };
      }
    } else {
      pack.oldPrice = null;
    }
  }

  return { packs: parsed };
}

export async function POST(req: NextRequest) {
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

    const fd = await req.formData();
    const name = fd.get("name");
    const description = fd.get("description");
    const category = fd.get("category");
    const size = fd.get("size");
    const status = fd.get("status");
    const imageFile = fd.get("image");

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, message: "Name and packs required" }, { status: 400 });
    }

    const { packs, error } = parsePacks(fd.get("packs"));
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    const drinkStatus = status ? String(status).toLowerCase() : "active";
    if (!VALID_STATUSES.includes(drinkStatus)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    let imageUrl = "";
    if (imageFile instanceof File && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = await uploadImage(buffer, `drink-${Date.now()}`);
    }

    const drink = await Drink.create({
      name: name.trim(),
      description: description ? String(description) : "",
      category: category ? String(category) : "",
      size: size ? String(size) : "",
      status: drinkStatus,
      available: true,
      imageUrl,
      packs,
    });

    return NextResponse.json({ success: true, message: "Drink added", drink }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Add drink error:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
