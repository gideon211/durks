import mongoose, { Schema, Document } from "mongoose";

export interface IInventory extends Document {
  product: string;
  sku: string;
  stock: number;
  reorderPoint: number;
  supplier: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    product: { type: String, required: true },
    sku: { type: String, unique: true, required: true },
    stock: { type: Number, default: 0 },
    reorderPoint: { type: Number, default: 0 },
    supplier: { type: String },
    unit: { type: String, default: "units" },
  },
  { timestamps: true }
);

export default mongoose.models.Inventory || mongoose.model<IInventory>("Inventory", inventorySchema);
