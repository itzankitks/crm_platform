import { Request, Response } from "express";
import { Campaign, ICampaign } from "../models/campaign.model";
import { Segment, ISegment } from "../models/segment.model";
import { Message, IMessage } from "../models/message.model";
import mongoose, { Types } from "mongoose";
import { messageQueue } from "../utils/queues/message.queue";
import { enqueueCampaignMessages } from "../services/message.service";

const createNewCampaign = async (req: Request, res: Response) => {
  try {
    const { title, segmentId, messageTemplate, customerIds, intent } = req.body;

    const campaign = await Campaign.create({
      title,
      segmentId,
      messageTemplate,
      customerIds,
      audienceSize: customerIds.length,
      intent,
      status: "pending",
    });

    await enqueueCampaignMessages(
      (campaign._id as Types.ObjectId).toString(),
      customerIds,
      messageTemplate
    );

    res.status(201).json({
      message: "Campaign created and messages enqueued",
      campaign,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
};

const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const allCampaigns: ICampaign[] = await Campaign.find({});
    return res.status(200).json({ campaigns: allCampaigns });
  } catch (error) {
    console.log("Error while fetching Campaigns: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const getCampaignById = async (req: Request, res: Response) => {
  try {
    console.log("Fetching campaign by ID");
    const campaignId = req.params.id;

    const campaign: ICampaign | null = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "The Campaign does not exist" });
    }

    const messages: IMessage[] = await Message.find({ campaignId: campaignId });

    if (messages.length === 0) {
      return res.status(404).json({ error: "No Messages Found" });
    }

    return res.status(200).json({ campaign: campaign, messages: messages });
  } catch (error) {
    console.log("Error while fetching Campaign: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const updateCampaignById = async (req: Request, res: Response) => {
  try {
    const campaignId = req.params.id;
    const {
      title,
      segmentId,
      messageTemplate,
      status,
      customerIds,
      audienceSize,
      intent,
    } = req.body;

    const updateObj: Partial<ICampaign> = {};
    if (title !== undefined) updateObj.title = title;
    if (segmentId !== undefined)
      updateObj.segmentId = segmentId
        ? new mongoose.Types.ObjectId(segmentId)
        : null;
    if (messageTemplate !== undefined)
      updateObj.messageTemplate = messageTemplate;
    if (status !== undefined) updateObj.status = status;
    if (customerIds !== undefined)
      updateObj.customerIds = customerIds.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );
    if (audienceSize !== undefined) updateObj.audienceSize = audienceSize;
    if (intent !== undefined) updateObj.intent = intent;

    const updatedCampaign: ICampaign | null = await Campaign.findByIdAndUpdate(
      campaignId,
      updateObj,
      { new: true }
    );

    if (!updatedCampaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    return res.status(200).json({ campaign: updatedCampaign });
  } catch (error) {
    console.log("Error while updating Campaign: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const deleteCampaignById = async (req: Request, res: Response) => {
  try {
    const campaignId = req.params.id;

    const deletedCampaign: ICampaign | null = await Campaign.findByIdAndDelete(
      campaignId
    );

    if (!deletedCampaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await Message.deleteMany({ campaignId: campaignId });

    return res.status(200).json({
      message: "Campaign deleted successfully",
      campaign: deletedCampaign,
    });
  } catch (error) {
    console.log("Error while deleting Campaign: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

export {
  createNewCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaignById,
  deleteCampaignById,
};
