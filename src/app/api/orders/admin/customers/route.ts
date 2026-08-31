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

    const sp = req.nextUrl.searchParams;

    // Lightweight path: just the distinct paid-customer count (used by dashboard).
    if (sp.get("count") === "true") {
      const [res] = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: "$customer.email" } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      return NextResponse.json({ success: true, count: res?.count ?? 0 });
    }

    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(sp.get("limit") || "100", 10) || 100));

    const [countAgg, customers] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: "$customer.email" } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
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
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    void logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_customers",
      details: "Admin fetched customers list",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    const total = countAgg[0]?.count ?? 0;
    return NextResponse.json({ success: true, count: total, total, page, pages: Math.max(1, Math.ceil(total / limit)), customers });
  } catch (error: unknown) {
    console.error("Admin customers error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
