import { Types } from "mongoose";
import { Campaign } from "../models/campaign.model";
import { IMessage, Message } from "../models/message.model";
import { redisPublisher } from "../config/redis";

export async function enqueueCampaignMessages(
  campaignId: string,
  customerIds: string[],
  messageTemplate: string
) {
  const messageDocs = customerIds.map((cid) => ({
    text: messageTemplate,
    campaignId: new Types.ObjectId(campaignId),
    customerId: new Types.ObjectId(cid),
    customerName: undefined,
    status: "PENDING",
  }));

  const createdMessages = await Message.insertMany(messageDocs, {
    ordered: false,
  });

  const sendJobs = createdMessages.map((m) => ({
    messageId: (m._id as Types.ObjectId).toString(),
    customerId: m.customerId.toString(),
    text: m.text,
  }));

  await redisPublisher.publish("campaign:send", JSON.stringify(sendJobs));

  return { createdMessagesCount: createdMessages.length };
}
