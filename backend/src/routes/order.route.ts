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

router.post("/", createOrders);
router.post("/bulk", upload.single("csv"), createBulkOrders);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrderById);
router.delete("/:id", deleteOrderById);

export default router;
