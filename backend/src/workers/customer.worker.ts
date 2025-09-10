import { redisSubscriber, redisPublisher } from "../config/redis";
import { Customer } from "../models/customer.model";

const processCustomers = () => {
  redisSubscriber.subscribe("customers:new", (err) => {
    if (err) {
      console.error("Failed to subscribe to Redis channel:", err);
      return;
    }
    console.log("Subscribed to customers:new channel");
  });

  redisSubscriber.on("message", async (channel, message) => {
    if (channel === "customers:new") {
      try {
        const customers = JSON.parse(message);
        console.log(`Received ${customers.length} customers for processing`);

        for (const customer of customers) {
          await Customer.create(customer);
          console.log(`Created customer: ${customer.name}`);
        }
      } catch (error) {
        console.error("Error processing customers:", error);
      }
    }
  });
};

processCustomers();
