import express, { Router } from "express";
import {
  createOrders,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
} from "../controllers/order.controller";

const router: Router = express.Router();

router.post("/", createOrders);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrderById);
router.delete("/:id", deleteOrderById);

export default router;
