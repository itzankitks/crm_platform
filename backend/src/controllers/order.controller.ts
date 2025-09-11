import { Request, Response } from "express";
import { Order, IOrder } from "../models/order.model";
import { Customer, ICustomer } from "../models/customer.model";
import mongoose from "mongoose";
import { redisPublisher } from "../config/redis";
import multer from "multer";
import { parse } from "csv-parse/sync";
import fs from "fs";

interface OrderData {
  customerId: string;
  cost: number;
}

const createOrders = async (req: Request, res: Response) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: "At least one order required" });
    }

    for (const o of orders) {
      if (!o.customerId)
        return res.status(400).json({ error: "Customer ID required" });
      if (!o.cost || o.cost <= 0)
        return res.status(400).json({ error: "Cost must be > 0" });
    }

    await redisPublisher.publish("orders:new", JSON.stringify(orders));

    return res.status(202).json({
      message: "Orders queued for creation",
      count: orders.length,
    });
  } catch (err) {
    console.error("Error queuing orders:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createBulkOrders = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file uploaded" });
    }

    const csvData = fs.readFileSync(req.file.path, "utf8");
    const records = parse(csvData, {
      columns: false,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "CSV file is empty" });
    }

    const orders = records.map((record) => {
      if (record.length < 2) {
        throw new Error(`Invalid row format: ${record.join(",")}`);
      }

      const customerId = record[0].trim();
      const cost = parseFloat(record[1].trim());

      if (!customerId) {
        throw new Error(`Missing customerId in row: ${record.join(",")}`);
      }

      if (isNaN(cost) || cost <= 0) {
        throw new Error(`Invalid cost in row: ${record.join(",")}`);
      }

      return {
        customerId,
        cost,
      };
    });

    fs.unlinkSync(req.file.path);

    await redisPublisher.publish("orders:new", JSON.stringify(orders));

    return res.status(202).json({
      message: "Orders from CSV queued for creation",
      count: orders.length,
    });
  } catch (err) {
    console.error("Error processing CSV:", err);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders: IOrder[] = await Order.find({});
    return res.status(200).json({ orders });
  } catch (error) {
    console.log("Error in get all orders: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const order: IOrder | null = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.log("Error in get order by id: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const updateOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const updateData: Partial<OrderData> = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    if (updateData.cost !== undefined && updateData.cost === 0) {
      return res.status(400).json({ error: "Order cost must not be 0" });
    }

    const updatedOrder: IOrder | null = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.log("Error in update order: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const deleteOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const deletedOrder: IOrder | null = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json({
      message: "Order deleted successfully",
      order: deletedOrder,
    });
  } catch (error) {
    console.log("Error in delete order: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

export {
  createOrders,
  createBulkOrders,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
};
