import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Drink from "@/models/drinks";

export async function GET() {
  try {
    await connectDB();
    const stats = await Drink.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return NextResponse.json({ success: true, stats });
  } catch (error: unknown) {
    console.error("Drinks category stats error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
