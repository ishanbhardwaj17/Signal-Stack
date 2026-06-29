import mongoose from 'mongoose';
import {
  ALERT_OPERATORS,
  ALERT_SEVERITIES,
  METRIC_TYPES,
} from '../monitoring/monitoring.constants.js';

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
          ...METRIC_TYPES,
        ],
      },

      operator: {
        type: String,
        required: true,

        enum: [
          ...ALERT_OPERATORS,
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
          ...ALERT_SEVERITIES,
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
