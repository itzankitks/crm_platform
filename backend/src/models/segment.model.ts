import mongoose, { Document, Schema } from "mongoose";

export interface IRuleCondition {
  field: "totalSpending" | "countVisits" | "lastActiveAt";
  operator: ">" | "<" | ">=" | "<=" | "=" | "!=";
  value: number | string | Date;
}

export interface ISegment extends Document {
  name: string;
  rules: IRuleCondition[];
  logic: "AND" | "OR";
  userId: mongoose.Types.ObjectId;
}

const ruleConditionSchema = new Schema<IRuleCondition>(
  {
    field: {
      type: String,
      enum: ["totalSpending", "countVisits", "lastActiveAt"],
      required: true,
    },
    operator: {
      type: String,
      enum: [">", "<", ">=", "<=", "=", "!="],
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const segmentSchema = new Schema<ISegment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rules: [ruleConditionSchema],
    logic: {
      type: String,
      enum: ["AND", "OR"],
      default: "AND",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Segment = mongoose.model<ISegment>("Segment", segmentSchema);
