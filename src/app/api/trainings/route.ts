import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Training from "@/models/Training";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET() {
  try {
    await connectDB();
    const trainings = await Training.find();
    return NextResponse.json({ success: true, count: trainings.length, trainings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error fetching trainings:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    await connectDB();
    const body = await req.json();
    const { name, description, price, duration, format, category, status, maxParticipants, imageUrl } = body;

    if (!name || !price) {
      return NextResponse.json({ success: false, message: "Name and price are required" }, { status: 400 });
    }

    const newTraining = new Training({
      name,
      description: description || "",
      price: parseFloat(price),
      duration: duration || "4 weeks",
      format: format || "In-person",
      category: category || "",
      status: status ? status.toLowerCase() : "active",
      available: true,
      imageUrl: imageUrl || "",
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      currentParticipants: 0,
    });

    const savedTraining = await newTraining.save();

    await logActivity({
      ...buildActor(req, authUser),
      action: "create_training",
      details: `Created training "${savedTraining.name}"`,
      metadata: { trainingId: savedTraining._id.toString(), name: savedTraining.name, price: savedTraining.price, status: savedTraining.status },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Training added successfully", training: savedTraining }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error adding training:", error);
    await logError({ req, error, status: 500, actor: authUser, metadata: { message } });
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
