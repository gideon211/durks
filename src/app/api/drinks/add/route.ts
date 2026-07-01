import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Drink from "@/models/drinks";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    const { name, description, category, size, status, packs, imageUrl } = body;

    if (!name || !packs) {
      return NextResponse.json({ success: false, message: "Name and packs required" }, { status: 400 });
    }

    let parsedPacks = [];
    try {
      parsedPacks = typeof packs === "string" ? JSON.parse(packs) : packs;
    } catch {
      return NextResponse.json({ success: false, message: "Invalid packs format" }, { status: 400 });
    }

    const drink = await Drink.create({
      name,
      description: description || "",
      category: category || "",
      size: size || "",
      status: status?.toLowerCase() || "active",
      available: true,
      imageUrl: imageUrl || "",
      packs: parsedPacks,
    });

    return NextResponse.json({ success: true, message: "Drink added", drink }, { status: 201 });
  } catch (error: unknown) {
    console.error("Add drink error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
