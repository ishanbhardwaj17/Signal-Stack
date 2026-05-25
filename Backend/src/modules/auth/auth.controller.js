import asyncHandler from "../../utils/asyncHandler.js";

import {
    registerUser,
    loginUser,
    rotateRefreshToken,
    revokeRefreshToken,
    findRefreshToken,
} from "./auth.service.js";

import ApiError from "../../utils/ApiError.js";

import { cookieOptions } from "../../config/cookies.js";

export const register = asyncHandler(async (req, res) => {
    const result = await registerUser(req.body);

    res.status(201).json({
        success: true,
        data: result,
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const result = await loginUser(email, password, ipAddress);

    // Set cookies
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("access_token", result.accessToken, cookieOptions({ isProd, maxAgeMinutes: 15 }));

    res.cookie(
        "refresh_token",
        result.refreshToken,
        cookieOptions({ isProd, maxAgeDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "7", 10) })
    );

    res.status(200).json({ success: true, data: { user: result.user } });
});

export const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies["refresh_token"];

    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    if (!token) throw new ApiError(401, "Refresh token not provided");

    const tokenDoc = await findRefreshToken(token);

    if (!tokenDoc) {
        // reuse detection: token not found, possible theft
        throw new ApiError(401, "Invalid refresh token");
    }

    if (!tokenDoc.isActive) {
        // token revoked or expired -> possible reuse
        // revoke all refresh tokens for this user as a precaution
        await revokeRefreshToken(token, ipAddress);
        throw new ApiError(401, "Refresh token revoked or expired");
    }

    const rotated = await rotateRefreshToken(token, ipAddress);

    if (!rotated) throw new ApiError(401, "Unable to rotate refresh token");

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("access_token", rotated.accessToken, cookieOptions({ isProd, maxAgeMinutes: 15 }));

    res.cookie(
        "refresh_token",
        rotated.newRefreshToken,
        cookieOptions({ isProd, maxAgeDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "7", 10) })
    );

    res.json({ success: true, data: { user: { _id: rotated.user._id, email: rotated.user.email, name: rotated.user.name, role: rotated.user.role } } });
});

export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies["refresh_token"];

    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    if (token) {
        await revokeRefreshToken(token, ipAddress);
    }

    // Clear cookies
    res.clearCookie("access_token", cookieOptions({ isProd: process.env.NODE_ENV === "production" }));
    res.clearCookie("refresh_token", cookieOptions({ isProd: process.env.NODE_ENV === "production" }));

    res.json({ success: true, message: "Logged out" });
});