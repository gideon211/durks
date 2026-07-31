import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { signTokens } from "@/lib/auth";
import { logActivity } from "@/lib/activityLogger";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashedPassword,
      isAdmin: false,
    });

    const { token, refreshToken } = signTokens({
      id: user._id.toString(),
      isAdmin: false,
      email: user.email,
      username: user.username,
    });

    await logActivity({
      user: user._id.toString(),
      email: user.email,
      action: "signup",
      details: `User ${user.username} created an account`,
      ip: req.headers.get("x-forwarded-for") || req.ip || null,
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({
      message: "User registered successfully",
      token,
      refreshToken,
      role: "user",
      user: { id: user._id, username: user.username, email: user.email },
    }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
