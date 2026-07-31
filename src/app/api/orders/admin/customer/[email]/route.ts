import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import Order from "@/models/order";
import { verifyAuth, type AuthUser } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
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
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    await connectDB();
    const user = await User.findOneAndDelete({ email: decodedEmail });
    if (user) {
      await Order.deleteMany({ userId: user._id });
    }

    await logActivity({
      ...buildActor(req, authUser),
      action: "delete_customer",
      details: `Deleted customer ${decodedEmail}${user ? " and their orders" : " (no account found)"}`,
      metadata: { email: decodedEmail, userId: user?._id?.toString() ?? null },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (error: unknown) {
    console.error("Admin delete customer error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
