import mongoose, { Schema, Document } from "mongoose";

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  drinkId: mongoose.Types.ObjectId;
  quantity: number;
  pack: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    drinkId: {
      type: Schema.Types.ObjectId,
      ref: "Drink",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    pack: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1, drinkId: 1, pack: 1 }, { unique: true });

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);
