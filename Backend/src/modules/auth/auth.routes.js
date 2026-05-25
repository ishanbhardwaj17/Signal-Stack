import express from "express";

import { login, register, refreshToken, logout } from "./auth.controller.js";

import validate from "../../middleware/validate.middleware.js";

import { loginSchema, registerSchema } from "./auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refreshToken);

router.post("/logout", logout);

export default router;