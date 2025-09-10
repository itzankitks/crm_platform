import { messageQueue } from "../queues/message.queue";
import { Message } from "../models/message.model";
import { Types } from "mongoose";

export async function enqueueCampaignMessages(
  campaignId: string,
  customerIds: string[],
  messageTemplate: string
) {
  const messages = await Promise.all(
    customerIds.map(async (custId) => {
      const message = await Message.create({
        campaignId,
        customerId: custId,
        text: messageTemplate,
        status: "PENDING",
      });

      await messageQueue.add("send-message", {
        messageId: (message._id as Types.ObjectId).toString(),
      });

      return message;
    })
  );

  return messages;
}
