import { Request, Response } from "express";
import { Order, IOrder } from "../models/order.model";
import { Customer, ICustomer } from "../models/customer.model";
import mongoose from "mongoose";
import redis from "../config/redis";

interface OrderData {
  customerId: mongoose.Types.ObjectId | string;
  cost: number;
}

const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, cost }: OrderData = req.body;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID format" });
    }

    if (!cost || cost <= 0) {
      return res
        .status(400)
        .json({ error: "Order cost must be greater than 0" });
    }

    const customer: ICustomer | null = await Customer.findById(customerId);

    if (!customer) {
      return res
        .status(400)
        .json({ error: "Customer does not exist to create order" });
    }

    const newOrder = await Order.create({
      cost,
      customerId,
      createdAt: new Date(),
    });

    customer.totalSpending += cost;
    customer.countVisits += 1;
    await customer.save();

    await redis.publish(
      "orders",
      JSON.stringify({
        orderId: newOrder._id,
        customerId: customer._id,
        cost: cost,
      })
    );

    return res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
      updatedCustomer: customer,
    });
  } catch (error) {
    console.log("Error in create Order: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders: IOrder[] = await Order.find({});
    return res.status(200).json(orders);
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
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
};
