import mongoose, { Document, Schema } from "mongoose";

export interface ISegment extends Document {
  name: string;
  expression: string;
  userId: mongoose.Types.ObjectId;
}

const segmentSchema = new Schema<ISegment>(
  {
    name: { type: String, required: true, trim: true },
    expression: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Segment = mongoose.model<ISegment>("Segment", segmentSchema);
