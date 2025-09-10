import { redisSubscriber } from "../config/redis";
import { Order } from "../models/order.model";
import { Customer } from "../models/customer.model";

const processOrders = () => {
  redisSubscriber.subscribe("orders:new", (err) => {
    if (err) {
      console.error("Failed to subscribe to Redis channel:", err);
      return;
    }
    console.log("Subscribed to orders:new channel");
  });

  redisSubscriber.on("message", async (channel, message) => {
    if (channel === "orders:new") {
      try {
        const orders = JSON.parse(message);
        console.log(`Received ${orders.length} orders for processing`);

        for (const orderData of orders) {
          const { customerId, cost } = orderData;

          const customer = await Customer.findById(customerId);
          if (!customer) {
            console.warn(`Customer not found for order: ${customerId}`);
            continue;
          }

          await Order.create({
            customerId,
            cost,
            createdAt: new Date(),
          });

          customer.totalSpending += cost;
          customer.countVisits += 1;
          await customer.save();

          console.log(`Order created for customer: ${customer.name}`);
        }
      } catch (error) {
        console.error("Error processing orders:", error);
      }
    }
  });
};

processOrders();
