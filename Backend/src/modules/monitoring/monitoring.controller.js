import * as monitoringService from './monitoring.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const ingestMetric =
    asyncHandler(async (req, res) => {
        const metric =
            await monitoringService.ingestMetric(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                'Metric ingested successfully',
            data: metric,
        });
    });

export const getAlertRules =
    asyncHandler(async (req, res) => {
        const rules =
            await monitoringService.getAlertRules();

        return res.status(200).json({
            success: true,
            count: rules.length,
            data: rules,
        });
    });

export const createAlertRule =
    asyncHandler(async (req, res) => {
        const rule =
            await monitoringService.createAlertRule(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                'Alert rule created successfully',
            data: rule,
        });
    });

export const updateAlertRule =
    asyncHandler(async (req, res) => {
        const rule =
            await monitoringService.updateAlertRule(
                req.params.ruleId,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                'Alert rule updated successfully',
            data: rule,
        });
    });

export const deleteAlertRule =
    asyncHandler(async (req, res) => {
        await monitoringService.deleteAlertRule(
            req.params.ruleId
        );

        return res.status(200).json({
            success: true,
            message:
                'Alert rule deleted successfully',
        });
    });

export const getMonitoringActivity =
    asyncHandler(async (req, res) => {
        const activity =
            await monitoringService.getMonitoringActivity();

        return res.status(200).json({
            success: true,
            data: activity,
        });
    });
