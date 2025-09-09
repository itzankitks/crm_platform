import { Request, Response } from "express";
import { Campaign, ICampaign } from "../models/campaign.model";
import { Segment, ISegment } from "../models/segment.model";
import { Message, IMessage } from "../models/message.model";
import mongoose from "mongoose";
import { messageQueue } from "../utils/queues/message.queue";

const createNewCampaign = async (req: Request, res: Response) => {
  try {
    const { title, segmentId, messageTemplate } = req.body;

    const newCampaign = new Campaign({
      title: title,
      segmentId: new mongoose.Types.ObjectId(segmentId),
      status: Math.floor(Math.random() * 51) + 50,
      messageTemplate: messageTemplate,
    });

    await newCampaign.save();

    const segment: ISegment | null = await Segment.findById(segmentId).populate(
      "customerIds"
    );
    if (!segment) {
      return res.status(404).json({ error: "Segment not found" });
    }

    for (const customerId of segment.customerIds) {
      await messageQueue.add("send-message", {
        campaignId: newCampaign._id,
        customerId,
        messageTemplate,
      });
    }

    return res
      .status(201)
      .json({ campaign: newCampaign, msg: "Messages are queued" });
  } catch (error) {
    console.log("Error while creating Campaign: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
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
    const { title, segmentId, messageTemplate, status } = req.body;

    const updatedCampaign: ICampaign | null = await Campaign.findByIdAndUpdate(
      campaignId,
      {
        title: title,
        segmentId: segmentId
          ? new mongoose.Types.ObjectId(segmentId)
          : undefined,
        messageTemplate: messageTemplate,
        status: status,
      },
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
