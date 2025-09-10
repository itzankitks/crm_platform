import { redisSubscriber } from "../config/redis";
import { Campaign } from "../models/campaign.model";
import { Message } from "../models/message.model";

const BUFFER_FLUSH_INTERVAL_MS = 3000;
const BATCH_SIZE = 100;

type Receipt = {
  vendorMessageId: string;
  status: "SENT" | "FAILED" | string;
  receivedAt?: string;
};

let buffer: Receipt[] = [];
let flushing = false;

async function flushBuffer() {
  if (flushing) return;
  if (!buffer.length) return;

  flushing = true;
  const toFlush = buffer.splice(0, buffer.length);
  const ops = toFlush.map((r) => {
    const setObj: any = { status: r.status };
    if (r.status === "SENT") {
      setObj.deliveredAt = r.receivedAt ? new Date(r.receivedAt) : new Date();
    }
    return {
      updateOne: {
        filter: { vendorMessageId: r.vendorMessageId },
        update: { $set: setObj },
      },
    };
  });

  try {
    if (ops.length > 0) {
      await Message.bulkWrite(ops, { ordered: false });
      console.log(
        `delivery.batcher: flushed ${ops.length} receipts via bulkWrite`
      );
      const affectedCampaigns = await Message.distinct("campaignId", {
        vendorMessageId: { $in: toFlush.map((r) => r.vendorMessageId) },
      });

      for (const campaignId of affectedCampaigns) {
        const total = await Message.countDocuments({ campaignId });
        const done = await Message.countDocuments({
          campaignId,
          status: { $in: ["SENT", "FAILED"] },
        });

        if (done === 0) {
          continue;
        } else if (done < total) {
          await Campaign.findByIdAndUpdate(campaignId, {
            status: "in-progress",
          });
          console.log(`🚀 Campaign ${campaignId} is now in-progress`);
        } else if (done === total) {
          await Campaign.findByIdAndUpdate(campaignId, {
            status: "completed",
          });
          console.log(`✅ Campaign ${campaignId} marked as completed`);
        }
      }
    }
  } catch (err) {
    console.error("delivery.batcher: bulkWrite error", err);
  } finally {
    flushing = false;
  }
}

export const startDeliveryReceiptBatcher = () => {
  redisSubscriber.subscribe("delivery:receipts", (err) => {
    if (err) {
      console.error(
        "delivery.batcher: failed to subscribe to delivery:receipts",
        err
      );
      return;
    }
    console.log("delivery.batcher: subscribed to delivery:receipts");
  });

  redisSubscriber.on("message", (channel, message) => {
    if (channel !== "delivery:receipts") return;
    try {
      const r: Receipt = JSON.parse(message);
      buffer.push(r);

      if (buffer.length >= BATCH_SIZE) {
        flushBuffer().catch((err) => console.error("flushBuffer error", err));
      }
    } catch (err) {
      console.error("delivery.batcher: invalid receipt payload", err);
    }
  });

  setInterval(() => {
    if (buffer.length > 0) {
      flushBuffer().catch((err) => console.error("flushBuffer error", err));
    }
  }, BUFFER_FLUSH_INTERVAL_MS);
};

startDeliveryReceiptBatcher();
