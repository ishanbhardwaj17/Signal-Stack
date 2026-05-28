import mongoose from 'mongoose';

const alertRuleSchema =
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

      operator: {
        type: String,
        required: true,

        enum: [
          '>',
          '<',
          '>=',
          '<=',
          '==',
        ],
      },

      threshold: {
        type: Number,
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

      isActive: {
        type: Boolean,
        default: true,
      },
    },

    {
      timestamps: true,
    }
  );

const AlertRule = mongoose.model(
  'AlertRule',
  alertRuleSchema
);

export default AlertRule;