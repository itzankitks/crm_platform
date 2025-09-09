import { Router } from "express";
import { Message } from "../models/message.model";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { vendorMessageId, status } = req.body;

    if (!vendorMessageId || !status) {
      return res
        .status(400)
        .json({ error: "vendorMessageId and status required" });
    }

    const updateData: any = { status };
    if (status === "SENT") {
      updateData.deliveredAt = new Date();
    }

    const msg = await Message.findOneAndUpdate(
      { vendorMessageId },
      updateData,
      { new: true }
    );

    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }

    return res.json({
      message: "Delivery status updated",
      data: msg,
    });
  } catch (err) {
    console.error("Error updating receipt:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
