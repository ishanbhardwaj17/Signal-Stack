import asyncHandler from "../../utils/asyncHandler.js";

import {
    addComment,
    getIncidentComments,
} from "./comment.service.js";

export const addCommentController =
    asyncHandler(async (req, res) => {
        const comment = await addComment(
            req.params.incidentId,
            req.body.message,
            req.user
        );

        res.status(201).json({
            success: true,
            data: comment,
        });
    });

export const getIncidentCommentsController =
    asyncHandler(async (req, res) => {
        const comments = await getIncidentComments(
            req.params.incidentId
        );

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments,
        });
    });