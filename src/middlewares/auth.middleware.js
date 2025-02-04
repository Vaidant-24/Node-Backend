import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Missing or invalid token: No token provided"); // More specific message
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (jwtError) {
      // Catch JWT verification errors separately
      if (jwtError.name === "TokenExpiredError") {
        throw new ApiError(401, "Token expired", "ExpiredAccessToken"); // Differentiate expired tokens
      } else if (jwtError.name === "JsonWebTokenError") {
        throw new ApiError(
          401,
          `Invalid token: ${jwtError.message}`,
          "InvalidAccessToken"
        ); // More specific message
      } else {
        throw new ApiError(
          401,
          `Token verification failed: ${jwtError.message}`,
          "TokenVerificationError"
        ); // Generic JWT error
      }
    }

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized: User not found", "UserNotFound"); // Clearer message
    }

    req.user = user;
    next();
  } catch (error) {
    // Centralized error handling in your asyncHandler will catch this
    // No need to handle it again here. Just re-throw.
    throw error; // Re-throw the error to be handled by your global error handler
  }
});

export { verifyJWT };
