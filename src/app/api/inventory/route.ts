import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/inventory";
import { verifyAuth } from "@/lib/auth";

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
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const item = await Inventory.create(body);
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json({ success: false, message: "Failed to create inventory item" }, { status: 500 });
  }
}
