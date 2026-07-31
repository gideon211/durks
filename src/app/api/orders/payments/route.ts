import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    await connectDB();
    const payments = await Order.find({ paymentStatus: { $ne: "pending" } })
      .sort({ createdAt: -1 })
      .populate("userId", "email username")
      .lean();

    await logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_payments",
      details: "Admin fetched payments list",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, payments });
  } catch (error: unknown) {
    console.error("Get payments list error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to fetch payments" }, { status: 500 });
  }
}
