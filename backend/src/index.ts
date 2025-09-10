import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import routes from "./routes";
import "./workers/customer.worker";
import "./workers/order.worker";
import "./workers/message.sender.worker";
import "./workers/delivery.receipt.batcher";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
console.log("PORT:", process.env.PORT);

connectDB();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from CRM-Server" });
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
