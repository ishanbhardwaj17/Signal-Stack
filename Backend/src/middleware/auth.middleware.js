import jwt from "jsonwebtoken";
import User from "../modules/auth/user.model.js";
import ApiError from "../utils/ApiError.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.access_token;

        if (!token) {
            throw new ApiError(401, "Not authorized");
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        next();
    } catch (error) {
        // Forward a standardized error
        next(new ApiError(401, error.message || "Token failed"));
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, "Access denied"));
        }

        next();
    };
};