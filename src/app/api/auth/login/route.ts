import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { signTokens } from "@/lib/auth";
import { logActivity } from "@/lib/activityLogger";

function isFixedAdmin(email: string, password: string) {
  const admins = [
    { email: process.env.ADMIN_EMAIL_1, password: process.env.ADMIN_PASSWORD_1 },
    { email: process.env.ADMIN_EMAIL_2, password: process.env.ADMIN_PASSWORD_2 },
    { email: process.env.ADMIN_EMAIL_3, password: process.env.ADMIN_PASSWORD_3 },
  ];

  return admins.find(
    (admin) =>
      admin.email &&
      admin.password &&
      email.trim().toLowerCase() === admin.email.toLowerCase() &&
      password === admin.password
  );
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const matchedAdmin = isFixedAdmin(email, password);
    if (matchedAdmin) {
      let admin = await User.findOne({ email: matchedAdmin.email });

      if (!admin) {
        const hashedPassword = await bcrypt.hash(password, 10);
        admin = await User.create({
          username: matchedAdmin.email!.split("@")[0],
          email: matchedAdmin.email,
          passwordHash: hashedPassword,
          isAdmin: true,
        });
      } else if (!admin.isAdmin) {
        admin.isAdmin = true;
        await admin.save();
      }

      const { token, refreshToken } = signTokens({
        id: admin._id.toString(),
        isAdmin: true,
        email: admin.email,
        username: admin.username,
      });

      await logActivity({
        user: admin._id.toString(),
        email: admin.email,
        action: "login",
        details: "Admin logged in",
        ip: req.headers.get("x-forwarded-for") || req.ip || null,
        isAdmin: true,
        route: req.nextUrl?.pathname ?? null,
        method: req.method ?? null,
      });

      return NextResponse.json({
        message: "Admin logged in successfully",
        token,
        refreshToken,
        role: "admin",
        user: { id: admin._id, username: admin.username, email: admin.email },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    const { token, refreshToken } = signTokens({
      id: user._id.toString(),
      isAdmin: user.isAdmin,
      email: user.email,
      username: user.username,
    });

    await logActivity({
      user: user._id.toString(),
      email: user.email,
      action: "login",
      details: `User ${user.username} logged in`,
      ip: req.headers.get("x-forwarded-for") || req.ip || null,
      route: req.nextUrl?.pathname ?? null,
      method: req.method ?? null,
    });

    return NextResponse.json({
      message: "Login successful",
      token,
      refreshToken,
      role: user.isAdmin ? "admin" : "user",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
