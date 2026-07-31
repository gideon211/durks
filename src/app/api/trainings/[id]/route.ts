import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Training from "@/models/Training";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const training = await Training.findById(id);
    if (!training) {
      return NextResponse.json({ success: false, message: "Training not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, training });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error fetching training:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { id } = await params;
    const updates = await req.json();
    await connectDB();

    if (updates.status) updates.status = updates.status.toLowerCase();
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.maxParticipants !== undefined) {
      updates.maxParticipants = updates.maxParticipants ? parseInt(updates.maxParticipants) : null;
    }

    const before = await Training.findById(id).lean();
    if (!before) {
      return NextResponse.json({ success: false, message: "Training not found" }, { status: 404 });
    }

    const updatedTraining = await Training.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedTraining) {
      return NextResponse.json({ success: false, message: "Training not found" }, { status: 404 });
    }

    const changedFields: Record<string, { from: unknown; to: unknown }> = {};
    for (const key of Object.keys(updates)) {
      if (JSON.stringify((before as Record<string, unknown>)[key]) !== JSON.stringify(updates[key])) {
        changedFields[key] = { from: (before as Record<string, unknown>)[key], to: updates[key] };
      }
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "update_training",
      details: `Updated training "${updatedTraining.name}"`,
      metadata: { trainingId: id, changed: changedFields },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Training updated successfully", training: updatedTraining });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error updating training:", error);
    await logError({ req, error, status: 500, actor: authUser, metadata: { message } });
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { id } = await params;
    await connectDB();
    const deletedTraining = await Training.findByIdAndDelete(id);
    if (!deletedTraining) {
      return NextResponse.json({ success: false, message: "Training not found" }, { status: 404 });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "delete_training",
      details: `Deleted training "${deletedTraining.name}"`,
      metadata: { trainingId: id, name: deletedTraining.name },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Training deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error deleting training:", error);
    await logError({ req, error, status: 500, actor: authUser, metadata: { message } });
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
