/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Campaign management
 */

/**
 * @swagger
 * /campaigns:
 *   post:
 *     summary: Create new campaign
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Campaign'
 *     responses:
 *       201:
 *         description: Campaign created
 */

/**
 * @swagger
 * /campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *     responses:
 *       200:
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaigns:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 */

/**
 * @swagger
 * /campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The campaign ID
 *     responses:
 *       200:
 *         description: Campaign found
 *       404:
 *         description: Campaign not found
 */

/**
 * @swagger
 * /campaigns/{id}/stats:
 *   get:
 *     summary: Get campaign stats
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The campaign ID
 *     responses:
 *       200:
 *         description: Campaign stats
 *       404:
 *         description: Campaign not found
 */

/**
 * @swagger
 * /campaigns/{id}:
 *   put:
 *     summary: Update campaign by ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Campaign'
 *     responses:
 *       200:
 *         description: Campaign updated
 *       404:
 *         description: Campaign not found
 */

/**
 * @swagger
 * /campaigns/{id}:
 *   delete:
 *     summary: Delete campaign by ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The campaign ID
 *     responses:
 *       200:
 *         description: Campaign deleted
 *       404:
 *         description: Campaign not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         segmentId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, draft, active, completed]
 *         messageTemplate:
 *           type: string
 *         customerIds:
 *           type: array
 *           items:
 *             type: string
 *         audienceSize:
 *           type: number
 *         intent:
 *           type: string
 */
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
