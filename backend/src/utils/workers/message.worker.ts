import { Worker } from "bullmq";
import redis from "../../config/redis";
import { Message } from "../../models/message.model";
import mongoose from "mongoose";

const worker = new Worker(
  "message-queue",
  async (job) => {
    const { campaignId, customerId, messageTemplate } = job.data;
    console.log(`Processing job ${job.id} for campaign ${campaignId}`);

    try {
      const response = await fetch(`${process.env.API_URL}/vendor/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          customerId,
          message: messageTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Vendor API error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Vendor API response: ${JSON.stringify(result)}`);

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        await Message.create(
          [
            {
              campaignId,
              customerId,
              text: messageTemplate,
              status: "PENDING",
              vendorMessageId: result.vendorMessageId,
            },
          ],
          { session }
        );
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  { connection: redis }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
