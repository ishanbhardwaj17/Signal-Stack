import { monitoringQueue } from '../../queues/monitoring.queue.js';

export const addTestJob = async (req, res) => {
    await monitoringQueue.add(
        'test-job',
        {
            message: 'BullMQ Working',
            createdAt: new Date(),
        }
    );

    return res.status(200).json({
        success: true,
        message: 'Job Added Successfully',
    });
};