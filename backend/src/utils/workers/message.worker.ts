import { Worker } from "bullmq";
import { redisConnection } from "../../config/redis";
import { Message } from "../../models/message.model";
import axios from "axios";

// Simulate vendor API
async function sendToVendor(customerName: string, text: string) {
  // 90% success, 10% failure
  const isSuccess = Math.random() < 0.9;

  return {
    success: isSuccess,
    vendorMessageId: `vendor-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`,
  };
}

async function sendToVendorSim(
  vendorMessageId: string,
  status: "SENT" | "FAILED"
) {
  await axios.post("http://localhost:8000/api/delivery/receipt", {
    vendorMessageId,
    status,
  });
}

export const messageWorker = new Worker(
  "message-queue",
  async (job) => {
    const { messageId } = job.data;

    const vendorResp = await sendToVendor(
      job.data.customerName || "User",
      job.data.text
    );

    const status = vendorResp.success ? "SENT" : "FAILED";
    await sendToVendorSim(vendorResp.vendorMessageId, status);

    return { status, vendorMessageId: vendorResp.vendorMessageId };
  },
  { connection: redisConnection }
);

messageWorker.on("completed", (job) => {
  console.log(`Message job ${job.id} completed`);
});

messageWorker.on("failed", (job, err) => {
  console.error(`Message job ${job?.id} failed:`, err);
});
