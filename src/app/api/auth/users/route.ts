import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    await connectDB();
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: "No user IDs provided" }, { status: 400 });
    }

    await connectDB();
    const result = await User.deleteMany({ _id: { $in: ids } });

    await logActivity({
      ...buildActor(req, authUser),
      action: "batch_delete_users",
      details: `Batch-deleted ${result.deletedCount} users`,
      metadata: { count: result.deletedCount, ids },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    console.error("batchDeleteUsers error:", err);
    await logError({ req, error: err, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
