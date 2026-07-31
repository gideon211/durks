import { NextRequest } from "next/server";
import connectDB from "./mongodb";
import ActivityLog from "@/models/ActivityLog";

export function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return null;
}

export interface ActorInfo {
  user: string | null;
  email: string | null;
  ip: string | null;
  isAdmin: boolean;
}

export function buildActor(
  req: NextRequest,
  authUser?: { id?: string; email?: string | null; isAdmin?: boolean } | null
): ActorInfo {
  return {
    user: authUser?.id ?? null,
    email: authUser?.email ?? null,
    ip: getClientIp(req),
    isAdmin: authUser?.isAdmin ?? false,
  };
}

export async function logActivity({
  user = null,
  email = null,
  action,
  details = "",
  metadata = {},
  ip = null,
  isAdmin = false,
  route = null,
  method = null,
}: {
  user?: string | null;
  email?: string | null;
  action: string;
  details?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  isAdmin?: boolean;
  route?: string | null;
  method?: string | null;
}) {
  try {
    await connectDB();
    await ActivityLog.create({ user, email, action, details, metadata, ip, isAdmin, route, method });
  } catch (err) {
    console.error("logActivity error:", err);
  }
}

export async function logError({
  req,
  error,
  status = 500,
  action = "api_error",
  details,
  metadata = {},
  actor = null,
}: {
  req: NextRequest;
  error: unknown;
  status?: number;
  action?: string;
  details?: string;
  metadata?: Record<string, unknown>;
  actor?: { id?: string | null; user?: string | null; email?: string | null; ip?: string | null; isAdmin?: boolean } | null;
}) {
  const message = error instanceof Error ? error.message : String(error);
  await logActivity({
    user: actor?.user ?? actor?.id ?? null,
    email: actor?.email ?? null,
    ip: actor?.ip ?? getClientIp(req),
    isAdmin: actor?.isAdmin ?? false,
    action,
    details: details || `Request failed (HTTP ${status})`,
    metadata: { ...metadata, status, error: message },
    route: req.nextUrl?.pathname ?? null,
    method: req.method ?? null,
  });
}
