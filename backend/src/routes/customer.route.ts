import { Router } from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
} from "../controllers/customer.controller";

const router = Router();

router.post("/", createCustomer);
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomerById);
router.delete("/:id", deleteCustomerById);

export default router;
