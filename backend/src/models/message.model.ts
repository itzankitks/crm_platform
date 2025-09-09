import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  text: string;
  campaignId: mongoose.Schema.Types.ObjectId;
  customerId: mongoose.Schema.Types.ObjectId;
  customerName?: string;
  status: "PENDING" | "SENT" | "FAILED";
  vendorMessageId: mongoose.Types.ObjectId;
  deliveredAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    text: {
      type: String,
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    customerName: {
      type: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
    },
    vendorMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
