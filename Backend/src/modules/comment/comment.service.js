import Comment from "./comment.model.js";

import Incident from "../incident/incident.model.js";

import ApiError from "../../utils/ApiError.js";
import { getIO } from "../../socket/socket.server.js";

export const addComment = async (
    incidentId,
    message,
    user
) => {
    const incident = await Incident.findById(
        incidentId
    );

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    // Engineers can comment only on assigned incidents
    if (
        user.role === "engineer" &&
        incident.assignedTo?.toString() !== user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You can only comment on assigned incidents"
        );
    }

    const comment = await Comment.create({
        incidentId,
        userId: user._id,
        message,
    });



    // Add timeline entry
    incident.timeline.push({
        action: "COMMENT_ADDED",

        current: "NEW_COMMENT",

        changedBy: user._id,
    });

    await incident.save();

    const io = getIO();

    io.to(incidentId.toString()).emit(
        "comment:added",
        comment
    );

    return await comment.populate(
        "userId",
        "name email role"
    );
};

export const getIncidentComments = async (
    incidentId
) => {
    const comments = await Comment.find({
        incidentId,
    })
        .populate("userId", "name email role")
        .sort({ createdAt: -1 });

    return comments;
};