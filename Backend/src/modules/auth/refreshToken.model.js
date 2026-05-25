import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    expires: { type: Date, required: true },

    createdByIp: { type: String },

    revokedAt: { type: Date },

    revokedByIp: { type: String },

    replacedByToken: { type: String },
  },
  { timestamps: true }
);

refreshTokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expires;
});

refreshTokenSchema.virtual("isActive").get(function () {
  return !this.revokedAt && !this.isExpired;
});

const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema
);

export default RefreshToken;
