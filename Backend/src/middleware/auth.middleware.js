import jwt from "jsonwebtoken";
import User from "../modules/auth/user.model.js";
import ApiError from "../utils/ApiError.js";
import {
    canOperateMonitoring,
    normalizeRole,
} from "../utils/roles.js";

const parseCookies = (cookieHeader = "") =>
    cookieHeader
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .reduce((cookies, entry) => {
            const separatorIndex =
                entry.indexOf("=");

            if (separatorIndex === -1) {
                return cookies;
            }

            const key = entry.slice(
                0,
                separatorIndex
            );
            const value = entry.slice(
                separatorIndex + 1
            );

            cookies[key] = decodeURIComponent(
                value
            );

            return cookies;
        }, {});

export const getAccessTokenFromRequest = (
    req
) => {
    const headerCookies = parseCookies(
        req.headers?.cookie || ""
    );

    return (
        req.cookies?.access_token ||
        headerCookies.access_token ||
        null
    );
};

export const verifyAccessToken = (
    token
) =>
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET ||
            process.env.JWT_SECRET
    );

export const getAuthenticatedUser =
    async (req) => {
        const token =
            getAccessTokenFromRequest(req);

        if (!token) {
            throw new ApiError(
                401,
                "Not authorized"
            );
        }

        const decoded =
            verifyAccessToken(token);

        const user = await User.findById(
            decoded.id
        ).select("-password");

        if (!user) {
            throw new ApiError(
                401,
                "User not found for session"
            );
        }

        return user;
    };

export const protect = async (req, res, next) => {
    try {
        req.user =
            await getAuthenticatedUser(
                req
            );

        next();
    } catch (error) {
        // Forward a standardized error
        next(new ApiError(401, error.message || "Token failed"));
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = normalizeRole(req.user.role);
        const allowedRoles = roles.map(normalizeRole);

        if (!allowedRoles.includes(userRole)) {
            return next(new ApiError(403, "Access denied"));
        }

        next();
    };
};

const getMonitoringToken = (
    req
) => {
    const headerToken =
        req.headers["x-monitoring-token"];
    const authHeader =
        req.headers.authorization;

    if (typeof headerToken === "string") {
        return headerToken.trim();
    }

    if (
        typeof authHeader === "string" &&
        authHeader.startsWith("Bearer ")
    ) {
        return authHeader.slice(7).trim();
    }

    return null;
};

export const authorizeMonitoringIngest =
    async (req, res, next) => {
        const configuredToken =
            process.env.MONITORING_INGEST_TOKEN;
        const providedToken =
            getMonitoringToken(req);

        if (
            configuredToken &&
            providedToken === configuredToken
        ) {
            req.monitoringAuth = {
                type: "token",
            };
            return next();
        }

        try {
            req.user =
                req.user ||
                (await getAuthenticatedUser(
                    req
                ));
        } catch {
            return next(
                new ApiError(
                    401,
                    "Monitoring ingestion requires a valid monitoring token or an elevated session"
                )
            );
        }

        if (
            !canOperateMonitoring(
                req.user.role
            )
        ) {
            return next(
                new ApiError(
                    403,
                    "Only senior engineers or admins can ingest monitoring events without a token"
                )
            );
        }

        req.monitoringAuth = {
            type: "session",
            userId: req.user._id,
        };

        next();
    };
