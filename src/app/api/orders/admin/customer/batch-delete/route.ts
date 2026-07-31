import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
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
    const { emails } = await req.json();
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ success: false, message: "No emails provided" }, { status: 400 });
    }
    await connectDB();
    const users = await User.find({ email: { $in: emails } });
    const userIds = users.map((u) => u._id);
    await User.deleteMany({ _id: { $in: userIds } });
    await Order.deleteMany({ userId: { $in: userIds } });

    await logActivity({
      ...buildActor(req, authUser),
      action: "batch_delete_customers",
      details: `Batch-deleted ${emails.length} customers`,
      metadata: { count: emails.length, emails, userIds: userIds.map((id) => id.toString()) },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: `${emails.length} customers deleted` });
  } catch (error: unknown) {
    console.error("Admin batch delete customers error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
