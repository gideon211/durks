import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Preorder from "@/models/preorder";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

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
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { id, status } = await req.json();
    await connectDB();

    const before = await Preorder.findById(id).lean();
    if (!before) {
      return NextResponse.json({ success: false, message: "Preorder not found" }, { status: 404 });
    }

    const preorder = await Preorder.findByIdAndUpdate(id, { status }, { new: true });
    if (!preorder) {
      return NextResponse.json({ success: false, message: "Preorder not found" }, { status: 404 });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "update_preorder_status",
      details: `Preorder ${id} status: ${(before as { status?: string }).status} → ${status}`,
      metadata: { preorderId: id, from: (before as { status?: string }).status, to: status },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, preorder });
  } catch (error: unknown) {
    console.error("Error updating preorder:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to update preorder" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { id } = await req.json();
    await connectDB();
    const preorder = await Preorder.findByIdAndDelete(id);
    if (!preorder) {
      return NextResponse.json({ success: false, message: "Preorder not found" }, { status: 404 });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "delete_preorder",
      details: `Deleted preorder ${id}`,
      metadata: { preorderId: id, email: preorder.email },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Preorder deleted" });
  } catch (error: unknown) {
    console.error("Error deleting preorder:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to delete preorder" }, { status: 500 });
  }
}
