import Metric from './monitoring.model.js';
import { monitoringQueue } from '../../queues/monitoring.queue.js';
import AlertRule from '../alerts/alertRule.model.js';
import Alert from '../alerts/alert.model.js';
import ApiError from '../../utils/ApiError.js';

export const ingestMetric = async (payload) => {
    
    const metric = await Metric.create(payload);

    await monitoringQueue.add(
        'metric-ingestion',
        {
            metricId: metric._id,
        }
    );

    return metric;
};

export const getAlertRules =
    async () => {
        return AlertRule.find()
            .sort({
                isActive: -1,
                createdAt: -1,
            });
    };

export const createAlertRule =
    async (payload) => {
        return AlertRule.create(payload);
    };

export const updateAlertRule =
    async (ruleId, payload) => {
        const rule =
            await AlertRule.findByIdAndUpdate(
                ruleId,
                payload,
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!rule) {
            throw new ApiError(
                404,
                'Alert rule not found'
            );
        }

        return rule;
    };

export const deleteAlertRule =
    async (ruleId) => {
        const rule =
            await AlertRule.findById(ruleId);

        if (!rule) {
            throw new ApiError(
                404,
                'Alert rule not found'
            );
        }

        await rule.deleteOne();
    };

export const getMonitoringActivity =
    async () => {
        const [
            rules,
            recentMetrics,
            recentAlerts,
        ] = await Promise.all([
            AlertRule.countDocuments(),
            Metric.find()
                .sort({ createdAt: -1 })
                .limit(10),
            Alert.find()
                .populate(
                    'incidentId',
                    'title status severity'
                )
                .sort({ createdAt: -1 })
                .limit(10),
        ]);

        return {
            summary: {
                totalRules: rules,
                recentMetrics: recentMetrics.length,
                recentAlerts: recentAlerts.length,
            },
            recentMetrics,
            recentAlerts,
        };
    };
