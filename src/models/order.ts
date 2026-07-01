import mongoose, { Schema, Document } from "mongoose";

export interface IOrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface IOrderItem {
  drinkId: mongoose.Types.ObjectId;
  image: string;
  name: string;
  pack: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId | null;
  customer: IOrderCustomer;
  items: IOrderItem[];
  deliveryDate: Date | null;
  deliveryTime: string | null;
  totalAmount: number;
  totalItems?: number;
  paystackReference: string;
  paymentStatus: "pending" | "paid" | "refunded";
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "completed" | "cancelled";
  orderNumber: string | null;
  vendor: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<IOrderCustomer>(
  {
    fullName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    phone: { type: String, trim: true, required: true },
    address: { type: String, trim: true, required: true },
    city: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "Ghana" },
  },
  { _id: false }
);

const itemSchema = new Schema<IOrderItem>(
  {
    drinkId: { type: Schema.Types.ObjectId, ref: "Drink", required: true, index: true },
    image: { type: String, trim: true, default: "" },
    name: { type: String, trim: true, required: true },
    pack: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    customer: { type: customerSchema, required: true },
    items: {
      type: [itemSchema],
      validate: {
        validator: (arr: IOrderItem[]) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },
    deliveryDate: {
      type: Date,
      default: null,
      set: (v: Date) => (isNaN(Date.parse(String(v))) ? null : new Date(v)),
    },
    deliveryTime: { type: String, trim: true, default: null },
    totalAmount: { type: Number, required: true, min: 0 },
    paystackReference: { type: String, required: true, trim: true, unique: true, index: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "completed", "cancelled"],
      default: "confirmed",
    },
    orderNumber: { type: String, trim: true, unique: true, sparse: true, index: true },
    vendor: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
