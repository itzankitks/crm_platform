import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.post("/send", async (req, res) => {
  const { campaignId, customerId, message } = req.body;

  const success = Math.random() < 0.9;
  const vendorMessageId = new mongoose.Types.ObjectId();

  setTimeout(async () => {
    try {
      await fetch(`${process.env.API_URL}/delivery-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorMessageId,
          campaignId,
          customerId,
          status: success ? "SENT" : "FAILED",
        }),
      });
    } catch (err) {
      console.error("Vendor failed to call back receipt:", err);
    }
  }, 2000);

  return res.json({
    vendorMessageId,
    status: "QUEUED",
  });
});

export default router;
