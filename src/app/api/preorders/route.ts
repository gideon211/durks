import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Preorder from "@/models/preorder";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const preorders = await Preorder.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, preorders });
  } catch (error: unknown) {
    console.error("Error fetching preorders:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch preorders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const preorder = await Preorder.create(body);
    return NextResponse.json({ success: true, preorder }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating preorder:", error);
    return NextResponse.json({ success: false, message: "Failed to create preorder" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { id, status } = await req.json();
    await connectDB();
    const preorder = await Preorder.findByIdAndUpdate(id, { status }, { new: true });
    if (!preorder) {
      return NextResponse.json({ success: false, message: "Preorder not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, preorder });
  } catch (error: unknown) {
    console.error("Error updating preorder:", error);
    return NextResponse.json({ success: false, message: "Failed to update preorder" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { id } = await req.json();
    await connectDB();
    await Preorder.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Preorder deleted" });
  } catch (error: unknown) {
    console.error("Error deleting preorder:", error);
    return NextResponse.json({ success: false, message: "Failed to delete preorder" }, { status: 500 });
  }
}
