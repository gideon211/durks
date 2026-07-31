import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
import User from "@/models/user";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {
    await connectDB();

    const customers = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$customer.email",
          fullName: { $first: "$customer.fullName" },
          phone: { $first: "$customer.phone" },
          city: { $first: "$customer.city" },
          orders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          lastOrder: { $max: "$createdAt" },
        },
      },
      { $lookup: { from: "users", localField: "_id", foreignField: "email", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { email: "$_id", fullName: 1, name: "$fullName", phone: 1, city: 1, orders: 1, totalSpent: 1, lastOrder: 1, username: "$user.username" } },
      { $sort: { totalSpent: -1 } },
    ]);

    await logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_customers",
      details: "Admin fetched customers list",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, count: customers.length, customers });
  } catch (error: unknown) {
    console.error("Admin customers error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
