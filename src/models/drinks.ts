import mongoose, { Schema, Document } from "mongoose";

export interface IPack {
  pack: number;
  price: number;
  oldPrice: number | null;
}

export interface IDrink extends Document {
  name: string;
  description: string;
  category: string;
  size: string;
  status: "active" | "inactive" | "few packs left" | "out of stock";
  available: boolean;
  imageUrl: string;
  packs: IPack[];
  createdAt: Date;
  updatedAt: Date;
}

const packSchema = new Schema<IPack>({
  pack: { type: Number, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: null },
});

const drinkSchema = new Schema<IDrink>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    size: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive", "few packs left", "out of stock"],
      default: "active",
    },
    available: { type: Boolean, default: true },
    imageUrl: { type: String, default: "" },
    packs: [packSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Drink || mongoose.model<IDrink>("Drink", drinkSchema);
