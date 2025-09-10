import { Router } from "express";
import {
  createNewCampaign,
  getAllCampaigns,
  getCampaignById,
  getCampaignStats,
  updateCampaignById,
  deleteCampaignById,
} from "../controllers/campaign.controller";

const router = Router();

router.post("/", createNewCampaign);
router.get("/", getAllCampaigns);
router.get("/:id", getCampaignById);
router.get("/:id/stats", getCampaignStats);
router.put("/:id", updateCampaignById);
router.delete("/:id", deleteCampaignById);

export default router;
