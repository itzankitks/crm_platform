import mongoose, { Schema, Document } from "mongoose";

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *     type: object
 *     properties:
 *      _id:
 *       type: string
 *      name:
 *       type: string
 *      email:
 *       type: string
 *      password:
 *       type: string
 */

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
