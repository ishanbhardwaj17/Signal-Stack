import express from "express";

import { login, register, refreshToken, logout, getMeController } from "./auth.controller.js";

import validate from "../../middleware/validate.middleware.js";
import { protect } from "../../middleware/auth.middleware.js";

import { loginSchema, registerSchema } from "./auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refreshToken);

router.get("/me", protect, getMeController);

router.post("/logout", logout);

export default router;