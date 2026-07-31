import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json();
  if (!refreshToken) {
    return NextResponse.json({ message: "Refresh token required" }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as {
      id: string;
      isAdmin: boolean;
      email?: string;
      username?: string;
    };

    const newAccessToken = jwt.sign(
      { id: decoded.id, isAdmin: decoded.isAdmin, email: decoded.email, username: decoded.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      message: "Access token refreshed successfully",
      token: newAccessToken,
    });
  } catch {
    return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 403 });
  }
}
