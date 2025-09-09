import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/user.model";

dotenv.config();
const secret_key: string = process.env.JWT_SECRET as string;

interface DecodedToken {
  _id: string;
  [key: string]: any;
}

const findUserInDb = async (id: string): Promise<IUser | null> => {
  try {
    console.log("Finding user with ID:", id);
    const user = await User.findById(id);
    console.log("User found in DB:", user);
    return user ? user.toObject() : null;
  } catch (error) {
    console.error("Error finding user in DB:", error);
    throw error;
  }
};

const decodeToken = (token: string): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret_key, (err, decodedData) => {
      if (err) {
        reject(err);
      } else {
        resolve(decodedData as DecodedToken);
      }
    });
  });
};

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authenticateJwt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      throw new Error("Token does not exist");
    }

    const decodedData = await decodeToken(token);

    const userId = decodedData.id;
    const user = await findUserInDb(userId);

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authenticateJwt:", error);
    if (error instanceof Error) {
      res.status(400).send(`Authentication failed: ${error.message}`);
    } else {
      res.status(400).send("Authentication failed: Unknown error");
    }
  }
};
