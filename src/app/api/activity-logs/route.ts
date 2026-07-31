import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { verifyAuth } from "@/lib/auth";
import { buildActor, logActivity, logError } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const action = searchParams.get("action");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

    await connectDB();

    const filter: Record<string, unknown> = {};
    if (email) filter.email = { $regex: email, $options: "i" };
    if (action) filter.action = action;

    const dateFilter: Record<string, Date> = {};
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) dateFilter.$gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!isNaN(d.getTime())) dateFilter.$lte = d;
    }
    if (Object.keys(dateFilter).length) filter.createdAt = dateFilter;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "username email")
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    await logActivity({
      ...buildActor(req, authUser),
      action: "admin_view_activity",
      details: `Admin viewed activity logs${email ? ` filtered by ${email}` : ""}`,
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({
      success: true,
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    console.error("getActivityLogs error:", error);
    await logError({ req, error, status: 500 });
    return NextResponse.json({ success: false, message: "Failed to fetch activity logs" }, { status: 500 });
  }
}
