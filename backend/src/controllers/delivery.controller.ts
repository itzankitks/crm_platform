import { Request, Response } from "express";
import { Message } from "../models/message.model";
import { redisPublisher } from "../config/redis";

export const deliveryReceipt = async (req: Request, res: Response) => {
  try {
    const { vendorMessageId, status } = req.body;

    if (!vendorMessageId || !status) {
      return res
        .status(400)
        .json({ error: "vendorMessageId and status required" });
    }

    await redisPublisher.publish(
      "delivery:receipts",
      JSON.stringify({
        vendorMessageId,
        status,
        receivedAt: new Date().toISOString(),
      })
    );

    return res.status(202).json({ message: "Receipt queued" });
  } catch (err) {
    console.error("deliveryReceipt error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
