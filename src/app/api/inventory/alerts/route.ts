import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/inventory";

export async function GET() {
  try {
    await connectDB();

    const critical = await Inventory.countDocuments({
      $expr: { $lte: ["$stock", { $divide: ["$reorderPoint", 2] }] },
    });
    const lowStock = await Inventory.countDocuments({
      $expr: {
        $and: [
          { $gt: ["$stock", { $divide: ["$reorderPoint", 2] }] },
          { $lte: ["$stock", "$reorderPoint"] },
        ],
      },
    });

    return NextResponse.json({ success: true, critical, lowStock });
  } catch (error: unknown) {
    console.error("Error fetching inventory alerts:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch inventory alerts" }, { status: 500 });
  }
}
