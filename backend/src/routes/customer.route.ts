import { Router } from "express";
import {
  createCustomers,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
} from "../controllers/customer.controller";

const router = Router();

router.post("/", createCustomers);
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomerById);
router.delete("/:id", deleteCustomerById);

export default router;
