import jwt from "jsonwebtoken";
import { unauthorized } from "../helper/responseHandler.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized(res, "Access token missing");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return unauthorized(res, "Invalid or expired access token");
  }
};
