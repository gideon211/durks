import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthUser {
  id: string;
  isAdmin: boolean;
}

export function verifyAuth(req: NextRequest): AuthUser {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; isAdmin: boolean };
    return { id: decoded.id, isAdmin: decoded.isAdmin };
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export function signTokens(payload: { id: string; isAdmin: boolean }) {
  const token = jwt.sign(payload, JWT_SECRET);
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET!);
  return { token, refreshToken };
}

export function verifyRefreshToken(refreshToken: string): { id: string; isAdmin: boolean } {
  return jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as { id: string; isAdmin: boolean };
}
