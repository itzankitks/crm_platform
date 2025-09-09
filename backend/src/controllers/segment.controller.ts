import { Request, Response } from "express";
import { Segment, ISegment } from "../models/segment.model";
import { Customer, ICustomer } from "../models/customer.model";
import { Order, IOrder } from "../models/order.model";
import { AuthenticatedRequest } from "../utils/auth";
import mongoose from "mongoose";

interface Condition {
  [key: string]: {
    [operator: string]: number;
  };
}

interface AggregatedOrder {
  _id: string;
  totalSpending: number;
  orderCount: number;
}

const createSegment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, query } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log(userId);
    const conditions = parseQueryToConditions(query);
    console.log("Parsed Conditions: ", conditions);

    const aggregateData: AggregatedOrder[] = await Order.aggregate([
      {
        $group: {
          _id: "$customerId",
          totalSpending: { $sum: "$cost" },
          orderCount: { $count: {} },
        },
      },
      {
        $match: conditions,
      },
    ]);

    console.log("Aggregated Data: ", aggregateData);
    const customerSize = aggregateData.length;
    const customerIds = aggregateData.map((item) => item._id);
    console.log(customerIds);

    const newSegment = new Segment({
      name: name,
      query: query,
      userId: userId,
      customerSize: customerSize,
      customerIds: customerIds,
    });

    const saveSegment = await newSegment.save();
    const customers = await Customer.find({ _id: { $in: customerIds } });

    res.status(200).json({ saveSegment, customers });
  } catch (error) {
    console.log("Error while creating Segment: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

function parseQueryToConditions(query: string): any {
  const conditions: Condition[] = [];
  const parts = splitQueryByLogicalOperators(query);
  console.log("Query Parts: ", parts);

  parts.forEach((part) => {
    const condition = parseCondition(part);
    if (condition) {
      conditions.push(condition);
    }
  });

  if (query.includes("AND")) {
    return { $and: conditions };
  } else if (query.includes("OR")) {
    return { $or: conditions };
  }
  return conditions.length > 1 ? { $and: conditions } : conditions[0];
}

function splitQueryByLogicalOperators(query: string): string[] {
  let regex = / AND | OR /i;
  return query.split(regex).map((part) => part.trim());
}

function parseCondition(part: string): Condition | null {
  interface OperatorConfig {
    regex: RegExp;
    operator: string;
  }

  const operators: OperatorConfig[] = [
    { regex: /([a-zA-Z]+)\s*=\s*(\d+)/, operator: "$eq" },
    { regex: /([a-zA-Z]+)\s*>\s*(\d+)/, operator: "$gt" },
    { regex: /([a-zA-Z]+)\s*<\s*(\d+)/, operator: "$lt" },
    { regex: /([a-zA-Z]+)\s*>=\s*(\d+)/, operator: "$gte" },
    { regex: /([a-zA-Z]+)\s*<=\s*(\d+)/, operator: "$lte" },
  ];

  for (let i = 0; i < operators.length; i++) {
    const match = part.match(operators[i].regex);
    if (match) {
      let field = match[1];
      const value = Number(match[2]);
      return { [field]: { [operators[i].operator]: value } };
    }
  }
  return null;
}

const getAllSegments = async (req: Request, res: Response) => {
  try {
    console.log("Fetching all segments");
    const segments = await Segment.find({});
    console.log("Segments fetched: ", segments);
    res.status(200).json({ segments });
  } catch (error) {
    console.log("Error getting all Segments: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const getSegmentById = async (req: Request, res: Response) => {
  try {
    const segmentId = req.params.id;
    const segment = await Segment.findById(segmentId);

    if (!segment) {
      return res.status(404).json({ message: "Segment not found" });
    }

    res.status(200).json(segment);
  } catch (error) {
    console.log("Error getting Segment: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const updateSegment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const segmentId = req.params.id;
    const { name, query } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const existingSegment = await Segment.findOne({
      _id: segmentId,
      userId: userId,
    });

    if (!existingSegment) {
      return res.status(404).json({
        error: "Segment not found or you don't have permission to update it",
      });
    }

    let customerSize = existingSegment.customerSize;
    let customerIds = existingSegment.customerIds;

    if (query) {
      const conditions = parseQueryToConditions(query);
      const aggregateData: AggregatedOrder[] = await Order.aggregate([
        {
          $group: {
            _id: "$customerId",
            totalSpending: { $sum: "$cost" },
            orderCount: { $count: {} },
          },
        },
        {
          $match: conditions,
        },
      ]);

      customerSize = aggregateData.length;
      customerIds = aggregateData.map(
        (item) => new mongoose.Types.ObjectId(item._id)
      );
    }

    const updatedSegment = await Segment.findByIdAndUpdate(
      segmentId,
      {
        name: name || existingSegment.name,
        query: query || existingSegment.query,
        customerSize: customerSize,
        customerIds: customerIds,
      },
      { new: true }
    );

    res.status(200).json(updatedSegment);
  } catch (error) {
    console.log("Error while updating Segment: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const deleteSegment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const segmentId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const deletedSegment = await Segment.findOneAndDelete({
      _id: segmentId,
      userId: userId,
    });

    if (!deletedSegment) {
      return res.status(404).json({
        error: "Segment not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      message: "Segment deleted successfully",
      segment: deletedSegment,
    });
  } catch (error) {
    console.log("Error while deleting Segment: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

export {
  createSegment,
  getAllSegments,
  getSegmentById,
  updateSegment,
  deleteSegment,
};
