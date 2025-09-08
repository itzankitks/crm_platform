import { Router } from "express";
import authRoutes from "./auth.route";

const router = Router();

// All routes defined here
router.use("/auth", authRoutes);

export default router;
