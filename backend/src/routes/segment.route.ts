/**
 * @swagger
 * tags:
 *   name: Segments
 *   description: Segment management
 */

/**
 * @swagger
 * /segment:
 *   post:
 *     summary: Create new segment
 *     tags: [Segments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Segment'
 *     responses:
 *       201:
 *         description: Segment created
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /segment/preview:
 *   post:
 *     summary: Preview segment
 *     tags: [Segments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Segment'
 *     responses:
 *       200:
 *         description: Segment preview
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /segment:
 *   get:
 *     summary: Get all segments
 *     tags: [Segments]
 *     responses:
 *       200:
 *         description: List of segments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 segments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Segment'
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /segment/{id}:
 *   get:
 *     summary: Get segment by ID
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The segment ID
 *     responses:
 *       200:
 *         description: Segment found
 *       404:
 *         description: Segment not found
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /segment/{id}/customers:
 *   get:
 *     summary: Get customers for segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The segment ID
 *     responses:
 *       200:
 *         description: Customers for segment
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /segment/{id}:
 *   put:
 *     summary: Update segment by ID
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The segment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Segment'
 *     responses:
 *       200:
 *         description: Segment updated
 *       404:
 *         description: Segment not found
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /segment/{id}:
 *   delete:
 *     summary: Delete segment by ID
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The segment ID
 *     responses:
 *       200:
 *         description: Segment deleted
 *       404:
 *         description: Segment not found
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Segment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         logic:
 *           type: string
 *         rules:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               operator:
 *                 type: string
 *               value:
 *                 type: string
 */
import { Router } from "express";
import { authenticateJwt } from "../utils/auth";
import {
  createSegment,
  getAllSegments,
  getSegmentById,
  updateSegment,
  deleteSegment,
  previewSegment,
  getCustomersForSegment,
} from "../controllers/segment.controller";

const router = Router();

router.post("/", authenticateJwt, createSegment);
router.post("/preview", authenticateJwt, previewSegment);
router.get("/", authenticateJwt, getAllSegments);
router.get("/:id", authenticateJwt, getSegmentById);
router.get("/:id/customers", authenticateJwt, getCustomersForSegment);
router.put("/:id", authenticateJwt, updateSegment);
router.delete("/:id", authenticateJwt, deleteSegment);

export default router;
