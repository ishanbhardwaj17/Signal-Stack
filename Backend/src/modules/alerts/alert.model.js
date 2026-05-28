import mongoose from 'mongoose';

const alertSchema =
    new mongoose.Schema(
        {
            service: {
                type: String,
                required: true,
                trim: true,
            },

            metricType: {
                type: String,
                required: true,

                enum: [
                    'cpu',
                    'memory',
                    'latency',
                    'errors',
                ],
            },

            metricValue: {
                type: Number,
                required: true,
            },

            threshold: {
                type: Number,
                required: true,
            },

            operator: {
                type: String,
                required: true,
            },

            severity: {
                type: String,
                required: true,

                enum: [
                    'low',
                    'medium',
                    'high',
                    'critical',
                ],
            },

            message: {
                type: String,
                required: true,
            },

            status: {
                type: String,

                enum: [
                    'open',
                    'acknowledged',
                    'resolved',
                ],

                default: 'open',
            },

            incidentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Incident',
                default: null,
            },

            triggeredAt: {
                type: Date,
                default: Date.now,
            },
        },

        {
            timestamps: true,
        }
    );

const Alert = mongoose.model(
    'Alert',
    alertSchema
);

export default Alert;