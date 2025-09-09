import { Request, Response } from "express";
import { Segment } from "../models/segment.model";
import { Customer } from "../models/customer.model";
import { AuthenticatedRequest } from "../utils/auth";

// Utility: Build MongoDB query from rules
function buildMongoQuery(rules: any[], logic: "AND" | "OR") {
  const conditions = rules.map((rule) => {
    const { field, operator, value } = rule;

    switch (operator) {
      case ">":
        return { [field]: { $gt: value } };
      case "<":
        return { [field]: { $lt: value } };
      case ">=":
        return { [field]: { $gte: value } };
      case "<=":
        return { [field]: { $lte: value } };
      case "=":
        return { [field]: value };
      case "!=":
        return { [field]: { $ne: value } };
      default:
        return {};
    }
  });

  return logic === "AND" ? { $and: conditions } : { $or: conditions };
}

export const createSegment = async (req: Request, res: Response) => {
  try {
    const { name, rules, logic, userId } = req.body;

    const mongoQuery = buildMongoQuery(rules, logic);
    const matchingCustomers = await Customer.find(mongoQuery);

    const segment = await Segment.create({
      name,
      rules,
      logic,
      userId,
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

export const updateSegment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, rules, logic } = req.body;

    const updated = await Segment.findByIdAndUpdate(
      req.params.id,
      { name, rules, logic },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Segment not found" });

    res.json({ message: "Segment updated", segment: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update segment" });
  }
};

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

export const previewSegment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { rules, logic } = req.body;

    const mongoQuery = buildMongoQuery(rules, logic);
    const customers = await Customer.find(mongoQuery);

    res.json({
      audienceSize: customers.length,
      customers,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to preview segment" });
  }
};
