import mongoose from 'mongoose';

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
                'cpu',
                'memory',
                'latency',
                'errors',
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