import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { verifyAuth } from "@/lib/auth";
import { logError } from "@/lib/activityLogger";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(10000)
      .populate("user", "username email")
      .lean();

    const header = ["timestamp", "email", "actor", "role", "action", "details", "ip", "route", "method", "metadata"];
    const rows = logs.map((log) => {
      const populatedUser = log.user as unknown as { username?: string; email?: string } | null;
      return [
        log.createdAt ? new Date(log.createdAt).toISOString() : "",
        log.email ?? "",
        populatedUser?.username ?? "",
        log.isAdmin ? "Admin" : "Customer",
        log.action,
        log.details ?? "",
        log.ip ?? "",
        log.route ?? "",
        log.method ?? "",
        log.metadata ? JSON.stringify(log.metadata) : "",
      ]
        .map(csvEscape)
        .join(",");
    });

    const csv = [header.join(","), ...rows].join("\r\n");
    const filename = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("exportActivityLogs error:", error);
    await logError({ req, error, status: 500 });
    return NextResponse.json({ success: false, message: "Failed to export activity logs" }, { status: 500 });
  }
}
