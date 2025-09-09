import { Queue } from "bullmq";
import redis from "../../config/redis";

export const messageQueue = new Queue("message-queue", {
  connection: redis,
});
