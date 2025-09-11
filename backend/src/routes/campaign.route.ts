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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
import { authenticateJwt } from "../utils/auth";

const router = Router();

router.post("/", authenticateJwt, createNewCampaign);
router.get("/", authenticateJwt, getAllCampaigns);
router.get("/:id", authenticateJwt, getCampaignById);
router.get("/:id/stats", authenticateJwt, getCampaignStats);
router.put("/:id", authenticateJwt, updateCampaignById);
router.delete("/:id", authenticateJwt, deleteCampaignById);

export default router;
