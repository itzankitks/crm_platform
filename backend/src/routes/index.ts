import { Router } from "express";
import authRoutes from "./auth.route";
import customerRoutes from "./customer.route";
import orderRoutes from "./order.route";
import campaignRoutes from "./campaign.route";
import segmentRoutes from "./segment.route";
import deliveryReceiptRoutes from "./receipt.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/campaign", campaignRoutes);
router.use("/customer", customerRoutes);
router.use("/order", orderRoutes);
router.use("/delivery", deliveryReceiptRoutes);
router.use("/segment", segmentRoutes);
// router.use("/vendor", );

export default router;
