import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import Order from "@/models/order";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {
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
