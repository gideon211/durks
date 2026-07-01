import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order";
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
    await Order.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ success: true, message: `${ids.length} orders deleted` });
  } catch (error: unknown) {
    console.error("Admin batch delete orders error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
