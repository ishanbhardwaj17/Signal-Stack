import express from 'express';
import { addTestJob } from './test.controller.js';
import {
    authorizeRoles,
    protect,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get(
    '/queue',
    protect,
    authorizeRoles("ADMIN"),
    addTestJob
);

export default router;
