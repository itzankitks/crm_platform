import { Request, Response } from "express";
import { Segment } from "../models/segment.model";
import { Customer } from "../models/customer.model";
import { AuthenticatedRequest } from "../utils/auth";
import { parseExpression } from "../utils/expressionParser";

// Create Segment
export const createSegment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, expression } = req.body;

    if (!name || !expression) {
      return res
        .status(400)
        .json({ error: "Name and expression are required" });
    }

    const mongoQuery = parseExpression(expression);
    console.log("mongoQuery:", mongoQuery);
    const matchingCustomers = await Customer.find(mongoQuery);

    const segment = await Segment.create({
      name,
      expression,
      userId: req.user?._id,
    });

    res.status(201).json({
      message: "Segment created successfully",
      segment,
      audienceSize: matchingCustomers.length,
    });
  } catch (error) {
    console.error("Error creating segment:", error);
    res.status(500).json({ error: "Failed to create segment" });
  }
};

// Get all segments for logged-in user
export const getAllSegments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const segments = await Segment.find({ userId: req.user?._id }).sort({
      createdAt: -1,
    });
    res.json({ segments });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch segments" });
  }
};

// Get segment by ID
export const getSegmentById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) return res.status(404).json({ error: "Segment not found" });

    res.json(segment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch segment" });
  }
};

// GET /segments/:id/customers
export const getCustomersForSegment = async (req: Request, res: Response) => {
  try {
    const segmentId = req.params.id;
    console.log("Fetching customers for segment ID:", segmentId);
    const segment = await Segment.findById(segmentId);
    if (!segment) return res.status(404).json({ error: "Segment not found" });

    const mongoQuery = parseExpression(segment.expression);
    console.log("Mongo Query for segment customers:", mongoQuery);
    const customers = await Customer.find(mongoQuery);

    res.json({ customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

// Update segment
export const updateSegment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, expression } = req.body;

    const updated = await Segment.findByIdAndUpdate(
      req.params.id,
      { name, expression },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Segment not found" });

    res.json({ message: "Segment updated", segment: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update segment" });
  }
};

// Delete segment
export const deleteSegment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const deleted = await Segment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Segment not found" });

    res.json({ message: "Segment deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete segment" });
  }
};

// Preview segment audience (without saving)
export const previewSegment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { expression } = req.body;
    if (!expression) {
      return res.status(400).json({ error: "Expression is required" });
    }

    const mongoQuery = parseExpression(expression);
    const customers = await Customer.find(mongoQuery);

    res.json({
      audienceSize: customers.length,
      customers,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to preview segment" });
  }
};
