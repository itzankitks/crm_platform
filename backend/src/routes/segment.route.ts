import { Router } from "express";
import { authenticateJwt } from "../utils/auth";
import {
  createSegment,
  getAllSegments,
  getSegmentById,
  updateSegment,
  deleteSegment,
  previewSegment,
} from "../controllers/segment.controller";

const router = Router();

router.post("/", authenticateJwt, createSegment);
router.post("/preview", authenticateJwt, previewSegment);
router.get("/", authenticateJwt, getAllSegments);
router.get("/:id", authenticateJwt, getSegmentById);
router.put("/:id", authenticateJwt, updateSegment);
router.delete("/:id", authenticateJwt, deleteSegment);

export default router;
