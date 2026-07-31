import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthUser {
  id: string;
  isAdmin: boolean;
  email?: string | null;
  username?: string | null;
}

export function verifyAuth(req: NextRequest): AuthUser {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      isAdmin: boolean;
      email?: string;
      username?: string;
    };
    return { id: decoded.id, isAdmin: decoded.isAdmin, email: decoded.email, username: decoded.username };
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export function signTokens(payload: {
  id: string;
  isAdmin: boolean;
  email?: string;
  username?: string;
}) {
  const token = jwt.sign(payload, JWT_SECRET);
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET!);
  return { token, refreshToken };
}

export function verifyRefreshToken(refreshToken: string): {
  id: string;
  isAdmin: boolean;
  email?: string;
  username?: string;
} {
  return jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as {
    id: string;
    isAdmin: boolean;
    email?: string;
    username?: string;
  };
}

export type RequireAdminResult =
  | { ok: true; user: AuthUser }
  | { ok: false; res: NextResponse };

export function requireAdmin(req: NextRequest): RequireAdminResult {
  let authUser: AuthUser;
  try {
    authUser = verifyAuth(req);
  } catch {
    return {
      ok: false,
      res: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!authUser.isAdmin) {
    return {
      ok: false,
      res: NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 }),
    };
  }
  return { ok: true, user: authUser };
}
