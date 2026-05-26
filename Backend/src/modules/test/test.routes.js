import express from 'express';
import { addTestJob } from './test.controller.js';

const router = express.Router();

router.get('/queue', addTestJob);

export default router;
