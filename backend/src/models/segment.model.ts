import mongoose, { Document, Schema } from "mongoose";

export interface ISegment extends Document {
  name: string;
  query: string;
  userId: mongoose.Types.ObjectId;
  customerSize: number;
  customerIds: mongoose.Types.ObjectId[];
}

const segmentSchema = new Schema<ISegment>(
  {
    name: {
      type: String,
      required: true,
    },
    query: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerSize: {
      type: Number,
      default: 0,
    },
    customerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],
  },
  { timestamps: true }
);

export const Segment = mongoose.model<ISegment>("Segment", segmentSchema);
