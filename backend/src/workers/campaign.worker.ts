// backend/src/workers/campaign.worker.ts
import { redisSubscriber, redisPublisher } from "../config/redis";
import { Campaign } from "../models/campaign.model";
import { Message } from "../models/message.model";
import { Customer } from "../models/customer.model";
import axios from "axios";

const processCampaigns = () => {
  redisSubscriber.subscribe("campaigns:new", (err) => {
    if (err) {
      console.error("Failed to subscribe to campaigns:new channel:", err);
      return;
    }
    console.log("Subscribed to campaigns:new channel");
  });

  redisSubscriber.on("message", async (channel, message) => {
    if (channel === "campaigns:new") {
      try {
        const campaignData = JSON.parse(message);
        console.log(`Processing campaign: ${campaignData.title}`);

        // Fetch campaign details from DB
        const campaign = await Campaign.findById(campaignData._id)
          .populate<{ customerIds: Array<{ _id: string; name: string }> }>(
            "customerIds"
          )
          .lean();

        if (!campaign) {
          console.error(`Campaign ${campaignData._id} not found`);
          return;
        }

        // Update campaign status to 'active'
        await Campaign.findByIdAndUpdate(campaign._id, { status: "active" });

        // Simulate sending messages to each customer
        for (const customer of campaign.customerIds) {
          const personalizedMessage = campaign.messageTemplate.replace(
            "{name}",
            customer.name
          );

          // Simulate vendor API call (90% success, 10% failure)
          const isSuccess = Math.random() > 0.1;
          const status = isSuccess ? "SENT" : "FAILED";

          // Create message log
          await Message.create({
            campaignId: campaign._id,
            customerId: customer._id,
            customerName: customer.name,
            text: personalizedMessage,
            status,
            vendorMessageId: isSuccess ? `vendor-${Date.now()}` : undefined,
            deliveredAt: isSuccess ? new Date() : undefined,
          });

          // Simulate calling vendor API
          if (isSuccess) {
            console.log(`Message sent to ${customer.name}`);
          } else {
            console.log(`Message failed for ${customer.name}`);
          }

          // Publish delivery receipt
          await redisPublisher.publish(
            "delivery:receipts",
            JSON.stringify({
              campaignId: campaign._id,
              customerId: customer._id,
              status,
            })
          );
        }

        // Update campaign status to 'completed'
        await Campaign.findByIdAndUpdate(campaign._id, { status: "completed" });
      } catch (error) {
        console.error("Error processing campaign:", error);
      }
    }
  });
};

// Start the worker
processCampaigns();
