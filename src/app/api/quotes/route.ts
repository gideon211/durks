import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quote from "@/models/quote";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const quotes = await Quote.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, quotes });
  } catch (error: unknown) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch quotes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const quote = await Quote.create(body);
    return NextResponse.json({ success: true, quote }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating quote:", error);
    return NextResponse.json({ success: false, message: "Failed to create quote" }, { status: 500 });
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
    const quote = await Quote.findByIdAndUpdate(id, { status }, { new: true });
    if (!quote) {
      return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, quote });
  } catch (error: unknown) {
    console.error("Error updating quote:", error);
    return NextResponse.json({ success: false, message: "Failed to update quote" }, { status: 500 });
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
    await Quote.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Quote deleted" });
  } catch (error: unknown) {
    console.error("Error deleting quote:", error);
    return NextResponse.json({ success: false, message: "Failed to delete quote" }, { status: 500 });
  }
}
