import jwt from "jsonwebtoken";
import { unauthorized } from "../helper/responseHandler.js";
import { verifyAccessToken } from "../helper/jwtHelper.js";

export const authMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized(res, "Not authorize, token missing");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired, please try again",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token, please try again",
      });
    }
    return unauthorized(res, "Invalid or expired token, please try again");
  }
};
