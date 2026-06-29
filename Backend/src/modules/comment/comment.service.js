import Comment from "./comment.model.js";

import Incident from "../incident/incident.model.js";
import {
    buildIncidentEventPayload,
    buildLiveFeedEvent,
} from "../incident/incident.service.js";

import ApiError from "../../utils/ApiError.js";
import { emitSocketEvent } from "../../socket/socket.events.js";
import {
    normalizeRole,
    ROLES,
} from "../../utils/roles.js";

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
        normalizeRole(user.role) ===
            ROLES.ENGINEER &&
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

    const populatedComment =
        await comment.populate(
            "userId",
            "name email role"
        );

    emitSocketEvent(
        "comment:added",
        populatedComment,
        { room: incidentId.toString() }
    );
    emitSocketEvent(
        "incident:feed",
        buildLiveFeedEvent(
            "COMMENT_ADDED",
            await buildIncidentEventPayload(
                incidentId
            ),
            {
                message: `${populatedComment.userId?.name || "A user"} added a comment`,
            }
        )
    );

    return populatedComment;
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
