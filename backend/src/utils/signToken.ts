import jwt from "jsonwebtoken";

const signToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

export default signToken;
