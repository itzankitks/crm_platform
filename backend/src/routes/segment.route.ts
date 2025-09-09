import { Router } from "express";
import { authenticateJwt } from "../utils/auth";
import {
  createSegment,
  getAllSegments,
  getSegmentById,
  updateSegment,
  deleteSegment,
} from "../controllers/segment.controller";

const router = Router();

router.post("/", authenticateJwt, createSegment);
router.get("/", getAllSegments);
router.get("/:id", getSegmentById);
router.put("/:id", authenticateJwt, updateSegment);
router.delete("/:id", authenticateJwt, deleteSegment);

export default router;
