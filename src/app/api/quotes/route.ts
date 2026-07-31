import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quote from "@/models/quote";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

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
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { id, status } = await req.json();
    await connectDB();

    const before = await Quote.findById(id).lean();
    if (!before) {
      return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    }

    const quote = await Quote.findByIdAndUpdate(id, { status }, { new: true });
    if (!quote) {
      return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "update_quote_status",
      details: `Quote ${id} status: ${(before as { status?: string }).status} → ${status}`,
      metadata: { quoteId: id, from: (before as { status?: string }).status, to: status },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, quote });
  } catch (error: unknown) {
    console.error("Error updating quote:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to update quote" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { id } = await req.json();
    await connectDB();
    const quote = await Quote.findByIdAndDelete(id);
    if (!quote) {
      return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "delete_quote",
      details: `Deleted quote ${id}`,
      metadata: { quoteId: id, email: quote.email },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Quote deleted" });
  } catch (error: unknown) {
    console.error("Error deleting quote:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to delete quote" }, { status: 500 });
  }
}
