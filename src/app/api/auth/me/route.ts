import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    await connectDB();

    const user = await User.findById(authUser.id).select("-passwordHash");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: user.isAdmin ? "Logged in as Admin" : "Logged in as User",
      user,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
