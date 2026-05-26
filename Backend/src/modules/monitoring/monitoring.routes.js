import express from 'express';

import {
    ingestMetric,
} from './monitoring.controller.js';

const router = express.Router();

router.post(
    '/ingest',
    ingestMetric
);

export default router;