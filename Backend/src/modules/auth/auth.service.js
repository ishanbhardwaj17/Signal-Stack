import bcrypt from "bcryptjs";

import crypto from "crypto";

import User from "./user.model.js";
import RefreshToken from "./refreshToken.model.js";

import jwt from "jsonwebtoken";

import ApiError from "../../utils/ApiError.js";

const normalizeRole = (role) =>
    typeof role === "string" ? role.toUpperCase() : role;

const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";

const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "7", 10);

const signAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES }
    );
};

const generateRefreshTokenString = () => {
    return crypto.randomBytes(64).toString("hex");
};

const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

const createRefreshToken = async (user, ipAddress) => {
    const token = generateRefreshTokenString();

    const tokenHash = hashToken(token);

    const expires = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    const refreshTokenDoc = await RefreshToken.create({
        token: tokenHash,
        user: user._id,
        expires,
        createdByIp: ipAddress,
    });

    return { token, tokenHash, expires: refreshTokenDoc.expires, doc: refreshTokenDoc };
};

export const registerUser = async (userData) => {
    const { name, email, password, role } = userData;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: normalizeRole(role) || "USER",
    });

    // Do not create tokens here; let controller call login flow if desired
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};

export const loginUser = async (email, password, ipAddress) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = signAccessToken(user);

    const refreshToken = await createRefreshToken(user, ipAddress);

    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        accessToken,
        refreshToken: refreshToken.token,
        refreshTokenExpires: refreshToken.expires,
    };
};

export const rotateRefreshToken = async (oldToken, ipAddress) => {
    const oldTokenHash = hashToken(oldToken);

    const tokenDoc = await RefreshToken.findOne({ token: oldTokenHash }).populate("user");

    if (!tokenDoc) return null;

    if (!tokenDoc.isActive) return tokenDoc; // caller will handle revoked/expired

    // create new token
    const newToken = await createRefreshToken(tokenDoc.user, ipAddress);

    // revoke old token and set replacedByToken (store hash)
    tokenDoc.revokedAt = new Date();
    tokenDoc.revokedByIp = ipAddress;
    tokenDoc.replacedByToken = newToken.tokenHash;
    await tokenDoc.save();

    const accessToken = signAccessToken(tokenDoc.user);

    return { user: tokenDoc.user, accessToken, newRefreshToken: newToken.token, newRefreshTokenExpires: newToken.expires };
};

export const revokeRefreshToken = async (token, ipAddress) => {
    const tokenHash = hashToken(token);

    const tokenDoc = await RefreshToken.findOne({ token: tokenHash });

    if (!tokenDoc) return null;

    tokenDoc.revokedAt = new Date();
    tokenDoc.revokedByIp = ipAddress;
    await tokenDoc.save();

    return tokenDoc;
};

export const findRefreshToken = async (token) => {
    const tokenHash = hashToken(token);

    return RefreshToken.findOne({ token: tokenHash }).populate("user");
};