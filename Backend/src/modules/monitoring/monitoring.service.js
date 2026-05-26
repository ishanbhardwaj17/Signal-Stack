import Metric from './monitoring.model.js';
import { monitoringQueue } from '../../queues/monitoring.queue.js';

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