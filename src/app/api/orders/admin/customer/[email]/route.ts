import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import Order from "@/models/order";
import { verifyAuth } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    await connectDB();
    const user = await User.findOneAndDelete({ email: decodedEmail });
    if (user) {
      await Order.deleteMany({ userId: user._id });
    }
    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (error: unknown) {
    console.error("Admin delete customer error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
