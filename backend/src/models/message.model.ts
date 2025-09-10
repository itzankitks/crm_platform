import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  campaignId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerName?: string;
  text: string;
  status: "PENDING" | "SENT" | "FAILED";
  vendorMessageId?: string;
  deliveredAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
    },
    vendorMessageId: {
      type: String,
      required: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

messageSchema.index({ campaignId: 1, customerId: 1 }, { unique: true });

messageSchema.index(
  { vendorMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { vendorMessageId: { $exists: true } },
  }
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
