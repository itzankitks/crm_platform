import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redisPublisher = new Redis(process.env.REDIS_URL!);

export const redisSubscriber = new Redis(process.env.REDIS_URL!);

redisPublisher.on("connect", () => {
  console.log("Redis publisher connected");
});

redisPublisher.on("error", (err) => {
  console.error("Redis publisher error:", err);
});

redisSubscriber.on("connect", () => {
  console.log("Redis subscriber connected");
});

redisSubscriber.on("error", (err) => {
  console.error("Redis subscriber error:", err);
});
