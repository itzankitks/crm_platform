import { Request, Response } from "express";
import { Message } from "../models/message.model";
import { redisPublisher } from "../config/redis";

/**
 * Simulated Delivery Receipt API
 * Vendor will POST { vendorMessageId, status }
 */
export const deliveryReceipt = async (req: Request, res: Response) => {
  try {
    const { vendorMessageId, status } = req.body;

    if (!vendorMessageId || !status) {
      return res
        .status(400)
        .json({ error: "vendorMessageId and status required" });
    }

    // await redis.rpush(
    //   "delivery_receipts",
    //   JSON.stringify({ vendorMessageId, status, receivedAt: new Date() })
    // );

    const message = await Message.findOne({ vendorMessageId });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.status = status;
    if (status === "SENT") {
      message.deliveredAt = new Date();
    }
    await message.save();

    return res
      .status(200)
      .json({ message: "Delivery status updated", data: message });
  } catch (error) {
    console.error("Delivery receipt error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
