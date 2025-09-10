import { redisSubscriber, redisPublisher } from "../config/redis";
import { Message } from "../models/message.model";
import { Customer } from "../models/customer.model";

async function simulateVendorSend(customerName: string, text: string) {
  await new Promise((r) => setTimeout(r, Math.random() * 200 + 50));
  const success = Math.random() < 0.9;
  const vendorMessageId = `vendor-${Date.now()}-${Math.floor(
    Math.random() * 100000
  )}`;
  return { success, vendorMessageId };
}

export const startMessageSenderWorker = () => {
  redisSubscriber.subscribe("campaign:send", (err) => {
    if (err) {
      console.error(
        "message.sender: failed to subscribe to campaign:send",
        err
      );
      return;
    }
    console.log("message.sender: subscribed to campaign:send");
  });

  redisSubscriber.on("message", async (channel, message) => {
    if (channel !== "campaign:send") return;
    try {
      const jobs: Array<{
        messageId: string;
        customerId: string;
        text: string;
      }> = JSON.parse(message);

      for (const job of jobs) {
        const { messageId, customerId, text } = job;

        let customerName = "Customer";
        try {
          const cust = await Customer.findById(customerId)
            .select("name")
            .lean();
          if (cust && (cust as any).name) customerName = (cust as any).name;
        } catch (err) {
          // fallback to name as Customer
        }

        const personalizedText = text.replace("{name}", customerName);

        const vendorResp = await simulateVendorSend(
          customerName,
          personalizedText
        );
        const status = vendorResp.success ? "SENT" : "FAILED";

        const update: any = {
          vendorMessageId: vendorResp.vendorMessageId,
          status,
          text: personalizedText,
        };
        if (vendorResp.success) update.deliveredAt = new Date();

        try {
          await Message.findByIdAndUpdate(messageId, { $set: update }).exec();
        } catch (err) {
          console.error(
            `message.sender: failed to update Message ${messageId}`,
            err
          );
        }

        try {
          await redisPublisher.publish(
            "delivery:receipts",
            JSON.stringify({
              vendorMessageId: vendorResp.vendorMessageId,
              status,
              receivedAt: new Date().toISOString(),
            })
          );
        } catch (err) {
          console.error("message.sender: failed publish delivery receipt", err);
        }
      }
    } catch (err) {
      console.error(
        "message.sender: error handling campaign:send message",
        err
      );
    }
  });
};

startMessageSenderWorker();
