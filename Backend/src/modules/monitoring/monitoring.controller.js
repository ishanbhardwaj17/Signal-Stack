import * as monitoringService from './monitoring.service.js';

export const ingestMetric = async (req, res) => {
    try {
        const metric =
            await monitoringService.ingestMetric(
                req.body
            );

        return res.status(201).json({
            success: true,
            message: 'Metric ingested successfully',
            data: metric,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};