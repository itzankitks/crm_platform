import mongoose, { Document, Schema } from "mongoose";
import { Customer } from "./customer.model";

export interface IOrder extends Document {
  cost: number;
  customerId: mongoose.Types.ObjectId;
  createdAt: Date;
  status: "pending" | "completed" | "cancelled";
}

const orderSchema = new Schema<IOrder>(
  {
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

orderSchema.post("save", async function (doc) {
  if (doc.status === "completed") {
    await Customer.findByIdAndUpdate(doc.customerId, {
      $inc: {
        totalSpending: doc.cost,
        countVisits: 1,
      },
      $set: {
        lastActiveAt: new Date(),
      },
    });
  }
});

export const Order = mongoose.model<IOrder>("Order", orderSchema);
