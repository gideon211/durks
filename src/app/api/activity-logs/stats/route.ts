import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;
  try {

    await connectDB();

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalActivities,
      uniqueCustomers,
      actionBreakdown,
      thisWeekCount,
      todayCount,
      thisMonthCount,
    ] = await Promise.all([
      ActivityLog.countDocuments(),
      ActivityLog.distinct("email").then((emails) => emails.filter(Boolean).length),
      ActivityLog.aggregate([
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ActivityLog.countDocuments({ createdAt: { $gte: startOfWeek } }),
      ActivityLog.countDocuments({ createdAt: { $gte: startOfToday } }),
      ActivityLog.countDocuments({
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      }),
    ]);

    await logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_stats",
      details: "Admin fetched activity log stats",
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalActivities,
        uniqueCustomers,
        thisWeek: thisWeekCount,
        today: todayCount,
        thisMonth: thisMonthCount,
        actionBreakdown: actionBreakdown.map((a) => ({ action: a._id, count: a.count })),
      },
    });
  } catch (error: unknown) {
    console.error("getActivityStats error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to fetch activity stats" }, { status: 500 });
  }
}
