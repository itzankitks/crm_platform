import mongoose, { Schema, Document } from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         campaignId:
 *           type: string
 *         customerId:
 *           type: string
 *         customerName:
 *           type: string
 *         text:
 *           type: string
 *         status:
 *           type: string
 *           enum:
 *             - PENDING
 *             - SENT
 *             - FAILED
 *         vendorMessageId:
 *           type: string
 *           nullable: true
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

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
