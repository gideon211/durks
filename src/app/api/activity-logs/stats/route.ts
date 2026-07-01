import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

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
    return NextResponse.json({ success: false, message: "Failed to fetch activity stats" }, { status: 500 });
  }
}
