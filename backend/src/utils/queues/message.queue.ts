import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis";

export const messageQueue = new Queue("message-queue", {
  connection: redisConnection,
});
