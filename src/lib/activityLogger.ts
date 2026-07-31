import crypto from "crypto";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import connectDB from "./mongodb";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/user";

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

export async function resolveActors<T extends Record<string, unknown>>(logs: T[]): Promise<(T & { user: { _id: unknown; username?: string; email?: string } | null })[]> {
  if (!logs.length) return logs.map((l) => ({ ...l, user: null }));

  const ids = Array.from(
    new Set(
      logs
        .map((l) => l.user)
        .filter((u) => u !== null && u !== undefined)
        .map((u) => String(u))
        .filter((s) => mongoose.isValidObjectId(s))
        .map((s) => new mongoose.Types.ObjectId(s))
    )
  );

  if (!ids.length) {
    return logs.map((l) => ({ ...l, user: null }));
  }

  const users = await User.find({ _id: { $in: ids } }).select("_id username email").lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return logs.map((l) => {
    const id = l.user === null || l.user === undefined ? "" : String(l.user);
    const u = byId.get(id);
    return { ...l, user: u ? { _id: u._id, username: u.username, email: u.email } : null };
  });
}

function hmacSecret(): string {
  return process.env.AUDIT_HMAC_SECRET || process.env.JWT_SECRET || "duks-activity-hmac";
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value === undefined ? null : value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map((v) => canonicalJson(v)).join(",") + "]";
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalJson(obj[k])).join(",") + "}";
}

export function computeAuditHash(fields: {
  id: unknown;
  createdAt: unknown;
  previousHash: string | null;
  user: unknown;
  email: string | null;
  action: string;
  details: string;
  metadata: unknown;
  ip: string | null;
  isAdmin: boolean;
  route: string | null;
  method: string | null;
}): string {
  return crypto.createHmac("sha256", hmacSecret()).update(canonicalJson(fields)).digest("hex");
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

    const prev = (await ActivityLog.findOne().sort({ _id: -1 }).select("hash").lean()) as { hash?: string | null } | null;
    const previousHash = prev?.hash ?? null;

    const log = await ActivityLog.create({ user, email, action, details, metadata, ip, isAdmin, route, method });

    const hash = computeAuditHash({
      id: log._id,
      createdAt: log.createdAt,
      previousHash,
      user,
      email,
      action,
      details,
      metadata,
      ip,
      isAdmin,
      route,
      method,
    });

    await ActivityLog.updateOne({ _id: log._id }, { $set: { hash, previousHash } });
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
  const pathname = req.nextUrl?.pathname ?? "";
  await logActivity({
    user: actor?.user ?? actor?.id ?? null,
    email: actor?.email ?? null,
    ip: actor?.ip ?? getClientIp(req),
    isAdmin: actor?.isAdmin ?? false,
    action,
    details: details || `Request failed (HTTP ${status}) — ${req.method ?? "?"} ${pathname}: ${message}`,
    metadata: { ...metadata, status, error: message },
    route: pathname || null,
    method: req.method ?? null,
  });
}

type ChainEntry = {
  _id: unknown;
  createdAt: unknown;
  user: unknown;
  email: string | null;
  action: string;
  details: string;
  metadata: unknown;
  ip: string | null;
  isAdmin: boolean;
  route: string | null;
  method: string | null;
  hash: string;
  previousHash: string | null;
};

export async function verifyAuditChain(limit = 5000): Promise<{
  valid: boolean;
  checked: number;
  brokenAt?: string | null;
  error?: string;
}> {
  try {
    await connectDB();

    const head = (await ActivityLog.findOne().sort({ _id: -1 }).lean()) as unknown as ChainEntry | null;
    if (!head) return { valid: true, checked: 0 };
    if (!head.hash) return { valid: true, checked: 0, error: "No hashed entries yet" };

    let current: ChainEntry | null = head;
    let checked = 0;

    while (current && checked < limit) {
      const expected = computeAuditHash({
        id: current._id,
        createdAt: current.createdAt,
        previousHash: current.previousHash ?? null,
        user: current.user ?? null,
        email: current.email ?? null,
        action: current.action,
        details: current.details ?? "",
        metadata: current.metadata ?? {},
        ip: current.ip ?? null,
        isAdmin: current.isAdmin,
        route: current.route ?? null,
        method: current.method ?? null,
      });

      if (expected !== current.hash) {
        return { valid: false, checked, brokenAt: String(current._id), error: `Hash mismatch at ${String(current._id)}` };
      }

      checked++;
      const previousHash = current.previousHash ?? null;
      if (!previousHash) break;

      current = (await ActivityLog.findOne({ hash: previousHash }).lean()) as unknown as ChainEntry | null;
      if (!current) {
        return { valid: false, checked, brokenAt: previousHash, error: "Chain gap: previous hash not found" };
      }
    }

    return { valid: true, checked };
  } catch (e) {
    return { valid: false, checked: 0, error: e instanceof Error ? e.message : String(e) };
  }
}
