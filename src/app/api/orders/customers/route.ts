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

    const customers = await Order.aggregate([
      {
        $group: {
          _id: { $toLower: "$customer.email" },
          fullName: { $first: "$customer.fullName" },
          email: { $first: { $toLower: "$customer.email" } },
          phone: { $first: "$customer.phone" },
          city: { $first: "$customer.city" },
          orders: { $sum: 1 },
          totalSpent: { $sum: { $ifNull: ["$totalAmount", 0] } },
        },
      },
      { $match: { email: { $ne: null } } },
      { $sort: { orders: -1 } },
    ]);

    await logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_customers",
      details: "Admin fetched customers list",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, customers });
  } catch (error: unknown) {
    console.error("Get customers error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to fetch customers" }, { status: 500 });
  }
}
