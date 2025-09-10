import { Request, Response } from "express";
import { Campaign, ICampaign } from "../models/campaign.model";
import { Segment, ISegment } from "../models/segment.model";
import { Message, IMessage } from "../models/message.model";
import mongoose, { Types } from "mongoose";
import { messageQueue } from "../queues/message.queue";
import { enqueueCampaignMessages } from "../services/campaign.service";
import { redisPublisher } from "../config/redis";

const createNewCampaign = async (req: Request, res: Response) => {
  try {
    const { title, segmentId, messageTemplate, customerIds, intent } = req.body;

    if (!segmentId)
      return res.status(400).json({ error: "segmentId required" });

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
      message: "Campaign created and messages queued",
      campaign,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
};

const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const allCampaigns: ICampaign[] = await Campaign.find({}).sort({
      createdAt: -1,
    });
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
    const campaignId = req.params.id;

    const campaign: ICampaign | null = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "The Campaign does not exist" });
    }

    const [total, sent, failed, pending] = await Promise.all([
      Message.countDocuments({ campaignId }),
      Message.countDocuments({ campaignId, status: "SENT" }),
      Message.countDocuments({ campaignId, status: "FAILED" }),
      Message.countDocuments({ campaignId, status: "PENDING" }),
    ]);

    return res.status(200).json({
      campaign,
      stats: {
        total,
        sent,
        failed,
        pending,
      },
    });
  } catch (error) {
    console.log("Error while fetching Campaign: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const getCampaignStats = async (req: Request, res: Response) => {
  try {
    console.log("Campaign Id:", req.params.id);
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) return res.status(404).json({ error: "Not found" });

    const [total, sent, failed] = await Promise.all([
      Message.countDocuments({ campaignId }),
      Message.countDocuments({ campaignId, status: "SENT" }),
      Message.countDocuments({ campaignId, status: "FAILED" }),
    ]);
    console.log({ total, sent, failed });

    return res.json({
      campaignId,
      audienceSize: campaign.audienceSize ?? 0,
      stats: {
        total,
        sent,
        failed,
      },
    });
  } catch (err) {
    console.error("getCampaignStats error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
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
  getCampaignStats,
  updateCampaignById,
  deleteCampaignById,
};
