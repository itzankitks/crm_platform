import mongoose, { Document, Schema, Model } from "mongoose";

export interface IOrder extends Document {
  cost: number;
  customerId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    cost: {
      type: Number,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
