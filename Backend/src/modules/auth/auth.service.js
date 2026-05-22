import bcrypt from "bcryptjs";

import User from "./user.model.js";

import generateToken from "../../utils/generateToken.js";

import ApiError from "../../utils/ApiError.js";

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
        role,
    });

    const token = generateToken(user._id, user.role);

    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = generateToken(user._id, user.role);

    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};