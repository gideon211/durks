import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError, resolveActors } from "@/lib/activityLogger";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;

  try {
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

    const rawLogs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean();

    const logs = await resolveActors(rawLogs);

    const header = ["timestamp", "email", "actor", "role", "action", "details", "ip", "route", "method", "hash", "metadata"];
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
        log.hash ?? "",
        log.metadata ? JSON.stringify(log.metadata) : "",
      ]
        .map(csvEscape)
        .join(",");
    });

    const csv = [header.join(","), ...rows].join("\r\n");
    const filename = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;

    void logActivity({
      ...buildActor(req, authUser),
      action: "admin_export_activity",
      details: `Admin exported activity logs (${rows.length} rows)`,
      metadata: { rows: rows.length, filters: { email: email || null, action: action || null, from: from || null, to: to || null } },
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("exportActivityLogs error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to export activity logs" }, { status: 500 });
  }
}
