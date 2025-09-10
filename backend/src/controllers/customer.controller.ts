import { Request, Response } from "express";
import { Customer, ICustomer } from "../models/customer.model";
import mongoose from "mongoose";
import { redisPublisher } from "../config/redis";

interface CustomerData {
  name: string;
  email?: string;
  phone?: string;
}

// const createCustomer = async (req: Request, res: Response) => {
//   try {
//     const customerData: CustomerData = req.body;
//     if (
//       !customerData.name ||
//       customerData.name.length === 0 ||
//       customerData.name.length > 100
//     ) {
//       return res.status(400).json({ error: "Name is invalid" });
//     }

//     const existingCustomer: ICustomer | null = await Customer.findOne({
//       name: customerData.name,
//     });
//     if (existingCustomer) {
//       return res.status(400).json({ error: "Customer already exists" });
//     }

//     const newCustomer = await Customer.create({
//       name: customerData.name,
//       email: customerData.email,
//       phone: customerData.phone,
//     });

//     await redisConnection.publish(
//       "customers",
//       JSON.stringify({
//         type: "CUSTOMER_CREATED",
//         payload: {
//           customerId: newCustomer._id,
//           name: newCustomer.name,
//         },
//       })
//     );

//     return res.status(201).json({
//       message: "Customer created successfully",
//       customer: newCustomer,
//     });
//   } catch (error) {
//     console.log("Error in create customer: ", error);
//     if (error instanceof Error) {
//       return res.status(400).json({ error: error.message });
//     }
//     return res.status(400).json({ error: "An unknown error occurred" });
//   }
// };

// POST /customers
const createCustomers = async (req: Request, res: Response) => {
  try {
    const { customers } = req.body;
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ error: "At least one customer required" });
    }

    // validate
    for (const cust of customers) {
      if (!cust.name)
        return res.status(400).json({ error: "Customer name required" });
    }

    // publish to Redis
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
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
};
