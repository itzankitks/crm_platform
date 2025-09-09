import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICampaign extends Document {
  title: string;
  segmentId: mongoose.Types.ObjectId | null;
  status: number;
  messageTemplate: string;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: {
      type: String,
      required: true,
    },
    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Segment",
      default: null,
    },
    status: {
      type: Number,
      min: 50,
      max: 100,
      default: 50,
    },
    messageTemplate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>("Campaign", campaignSchema);
