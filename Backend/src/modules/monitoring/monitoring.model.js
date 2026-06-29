import mongoose from 'mongoose';
import { METRIC_TYPES } from './monitoring.constants.js';

const metricSchema = new mongoose.Schema(
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
                ...METRIC_TYPES,
            ],
        },

        value: {
            type: Number,
            required: true,
        },

        timestamp: {
            type: Date,
            default: Date.now,
        },
    },

    {
        timestamps: true,
    }
);

const Metric = mongoose.model(
    'Metric',
    metricSchema
);

export default Metric;
