/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management
 */

/**
 * @swagger
 * /customer:
 *   post:
 *     summary: Create new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customers:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customers created
 */

/**
 * @swagger
 * /customer:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 */

/**
 * @swagger
 * /customer/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer found
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * /customer/{id}:
 *   put:
 *     summary: Update customer by ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * /customer/{id}:
 *   delete:
 *     summary: Delete customer by ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer deleted
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         totalSpending:
 *           type: number
 *         countVisits:
 *           type: number
 *         lastActiveAt:
 *           type: string
 *           format: date-time
 */
import { Router } from "express";
import {
  createCustomers,
  createBulkCustomers,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
} from "../controllers/customer.controller";
import multer from "multer";
import { parse } from "csv-parse/sync";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post("/", createCustomers);
router.post("/bulk", upload.single("csv"), createBulkCustomers);
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomerById);
router.delete("/:id", deleteCustomerById);

export default router;
