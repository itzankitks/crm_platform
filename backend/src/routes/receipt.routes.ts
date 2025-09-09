import { Router } from "express";
import { Message } from "../models/message.model";
import { deliveryReceipt } from "../controllers/delivery.controller";

const router = Router();

router.post("/receipt", deliveryReceipt);

export default router;
