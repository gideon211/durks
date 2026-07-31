import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Drink from "@/models/drinks";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {
    await connectDB();
    const stats = await Drink.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const categories = stats
      .filter((s: { _id: string }) => s._id)
      .map((s: { _id: string; count: number }) => ({ name: s._id, count: s.count }));

    await logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_drink_categories",
      details: "Admin fetched product category stats",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: unknown) {
    console.error("Drinks category stats error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
