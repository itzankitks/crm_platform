import express, { Router } from "express";
import {
  createOrders,
  createBulkOrders,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
} from "../controllers/order.controller";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { authenticateJwt } from "../utils/auth";

const router: Router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order(s)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Orders created
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         customerId:
 *           type: string
 *         cost:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const upload = multer({ dest: "uploads/" });

router.post("/", authenticateJwt, createOrders);
router.post("/bulk", authenticateJwt, upload.single("csv"), createBulkOrders);
router.get("/", authenticateJwt, getAllOrders);
router.get("/:id", authenticateJwt, getOrderById);
router.put("/:id", authenticateJwt, updateOrderById);
router.delete("/:id", authenticateJwt, deleteOrderById);

export default router;
