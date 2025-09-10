import { redisSubscriber } from "../config/redis";
import { Message } from "../models/message.model";

const processDeliveryReceipts = () => {
  redisSubscriber.subscribe("delivery:receipts", (err) => {
    if (err) {
      console.error("Failed to subscribe to delivery:receipts:", err);
      return;
    }
    console.log("Subscribed to delivery:receipts channel");
  });

  redisSubscriber.on("message", async (channel, message) => {
    if (channel === "delivery:receipts") {
      try {
        const receipts = JSON.parse(message);
        console.log(`Processing ${receipts.length} delivery receipts`);

        for (const r of receipts) {
          const { vendorMessageId, status } = r;
          const msg = await Message.findOne({ vendorMessageId });
          if (!msg) {
            console.warn(`Message not found: ${vendorMessageId}`);
            continue;
          }

          msg.status = status;
          if (status === "SENT") msg.deliveredAt = new Date();
          await msg.save();

          console.log(`Updated message status for: ${vendorMessageId}`);
        }
      } catch (error) {
        console.error("Error processing delivery receipts:", error);
      }
    }
  });
};

processDeliveryReceipts();
