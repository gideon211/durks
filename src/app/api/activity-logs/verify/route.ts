import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { buildActor, logActivity, logError, verifyAuditChain } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;
  const authUser = auth.user;

  try {
    const result = await verifyAuditChain();

    void logActivity({
      ...buildActor(req, authUser),
      action: "admin_verify_activity",
      details: result.valid
        ? `Verified audit chain — ${result.checked} entries intact`
        : `Audit chain integrity check failed: ${result.error}`,
      metadata: result,
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error("verifyActivityLogs error:", error);
    await logError({ req, error, status: 500, actor: authUser });
    return NextResponse.json({ success: false, message: "Failed to verify activity logs" }, { status: 500 });
  }
}
