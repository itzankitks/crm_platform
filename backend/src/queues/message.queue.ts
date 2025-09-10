import { Queue } from "bullmq";
import { redisPublisher } from "../config/redis";

export const messageQueue = new Queue("message-queue", {
  connection: redisPublisher,
});
