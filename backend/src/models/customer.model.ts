import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email?: string;
  phone?: string;
  totalSpending: number;
  countVisits: number;
  lastActiveAt?: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    totalSpending: {
      type: Number,
      default: 0,
      min: 0,
    },
    countVisits: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
