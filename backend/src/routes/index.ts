import { Router } from "express";
import authRoutes from "./auth.route";
import customerRoutes from "./customer.route";
import orderRoutes from "./order.route";
import campaignRoutes from "./campaign.route";
import segmentRoutes from "./segment.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/campaign", campaignRoutes);
router.use("/customer", customerRoutes);
router.use("/order", orderRoutes);
router.use("/deliver-receipt", orderRoutes);
router.use("/segment", segmentRoutes);
router.use("/vendor", segmentRoutes);

export default router;
