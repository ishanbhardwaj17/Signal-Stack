import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        incidentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Incident",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
commentSchema.index({ incidentId: 1 });

commentSchema.index({ createdAt: -1 });

const Comment = mongoose.model(
    "Comment",
    commentSchema
);

export default Comment;