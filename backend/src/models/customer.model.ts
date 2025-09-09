import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  totalSpending: number;
  countVisits: number;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
    },
    totalSpending: {
      type: Number,
      default: 0,
    },
    countVisits: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
