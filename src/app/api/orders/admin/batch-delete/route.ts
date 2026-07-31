import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { verifyAuth, type AuthUser } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function POST(req: NextRequest) {
  let authUser: AuthUser | null = null;
  try {
    try {
      authUser = verifyAuth(req);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: "No IDs provided" }, { status: 400 });
    }
    await connectDB();
    await Order.deleteMany({ _id: { $in: ids } });

    await logActivity({
      ...buildActor(req, authUser),
      action: "batch_delete_orders",
      details: `Batch-deleted ${ids.length} orders`,
      metadata: { count: ids.length, ids },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: `${ids.length} orders deleted` });
  } catch (error: unknown) {
    console.error("Admin batch delete orders error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
