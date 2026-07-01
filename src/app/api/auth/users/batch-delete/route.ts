import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: "No IDs provided" }, { status: 400 });
    }
    await connectDB();
    await User.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ success: true, message: `${ids.length} users deleted` });
  } catch (error: unknown) {
    console.error("Batch delete users error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
