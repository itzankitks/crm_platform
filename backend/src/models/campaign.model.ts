import mongoose, { Document, Schema } from "mongoose";

export interface ICampaign extends Document {
  title: string;
  segmentId: mongoose.Types.ObjectId | null;
  userId: mongoose.Types.ObjectId;
  status: "pending" | "in-progress" | "completed";
  messageTemplate: string;
  customerIds: mongoose.Types.ObjectId[];
  audienceSize: number;
  intent?: string;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Segment",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    messageTemplate: {
      type: String,
      required: true,
      trim: true,
    },
    customerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],
    audienceSize: {
      type: Number,
      default: 0,
    },
    intent: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>("Campaign", campaignSchema);
