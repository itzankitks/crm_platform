import { Request, Response } from "express";
import { Customer, ICustomer } from "../models/customer.model";
import mongoose from "mongoose";
import { redisPublisher } from "../config/redis";
import multer from "multer";
import { parse } from "csv-parse/sync";
import fs from "fs";

interface CustomerData {
  name: string;
  email?: string;
  phone?: string;
}

const createCustomers = async (req: Request, res: Response) => {
  try {
    const { customers } = req.body;
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ error: "At least one customer required" });
    }

    for (const cust of customers) {
      if (!cust.name)
        return res.status(400).json({ error: "Customer name required" });
    }

    await redisPublisher.publish("customers:new", JSON.stringify(customers));

    return res.status(202).json({
      message: "Customers queued for creation",
      count: customers.length,
    });
  } catch (err) {
    console.error("Error queuing customers:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createBulkCustomers = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file uploaded" });
    }

    // Read and parse the CSV file
    const csvData = fs.readFileSync(req.file.path, "utf8");
    const records: { name: string; email: string; phone: string }[] = parse(
      csvData,
      {
        columns: ["name", "email", "phone"], // Explicitly define columns
        skip_empty_lines: true,
        trim: true,
        from_line: 2, // Skip header row if it exists
      }
    ) as { name: string; email: string; phone: string }[];

    // Validate CSV format
    if (!records || records.length === 0) {
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ error: "CSV file is empty or invalid format" });
    }

    // Process records to create customers
    const customers = [];

    for (const record of records) {
      // Validate each row
      if (!record.name || !record.email || !record.phone) {
        throw new Error(`Missing required fields in row`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        throw new Error(`Invalid email format: ${record.email}`);
      }

      customers.push({
        name: record.name,
        email: record.email,
        phone: record.phone,
      });
    }

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    // Publish to Redis
    await redisPublisher.publish("customers:new", JSON.stringify(customers));

    return res.status(202).json({
      message: "Customers from CSV queued for creation",
      count: customers.length,
    });
  } catch (err) {
    console.error("Error processing CSV:", err);

    // Clean up the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers: ICustomer[] = await Customer.find({});
    return res.status(200).json({ customers });
  } catch (error) {
    console.log("Error in get all customers: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID format" });
    }
    const customer: ICustomer | null = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    return res.status(200).json(customer);
  } catch (error) {
    console.log("Error in get customer by ID: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const updateCustomerById = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id;
    const updateData: Partial<CustomerData> = req.body;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID format" });
    }
    if (
      updateData.name &&
      (updateData.name.length === 0 || updateData.name.length > 100)
    ) {
      return res.status(400).json({ error: "Name is invalid" });
    }
    const updatedCustomer: ICustomer | null = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.log("Error in update customer: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

const deleteCustomerById = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID format" });
    }
    const deletedCustomer: ICustomer | null = await Customer.findByIdAndDelete(
      customerId
    );
    if (!deletedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.status(200).json({
      message: "Customer deleted successfully",
      customer: deletedCustomer,
    });
  } catch (error) {
    console.log("Error in delete customer: ", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
  }
};

export {
  createCustomers,
  createBulkCustomers,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
};
