import { useEffect, useState, useCallback } from "react";

import { useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
    connectSocket,
    getSocket,
} from "../../../shared/services/socket.service";

import {
    setIncidentLoading,
    setSelectedIncident,
    setIncidentError,
} from "../state/incident.slice";

import { fetchIncidentById, fetchComments } from "../services/incident.api";

import IncidentHeader from "../components/IncidentHeader";

import AISummaryCard from "../components/AISummaryCard";

import TimelineCard from "../components/TimelineCard";

import IncidentActions from "../components/IncidentActions";
import IncidentAssignmentCard from "../components/IncidentAssignmentCard";

import CommentsCard from "../components/CommentsCard";

import CommentInput from "../components/CommentInput";

function IncidentDetails() {
    const { id } = useParams();
    const [comments, setComments] = useState([]);

    const dispatch = useDispatch();

    const {
        selectedIncident,
        loading,
    } = useSelector(
        (state) => state.incidents
    );
    const currentUser = useSelector(
        (state) => state.auth.user
    );

    const loadComments = useCallback(async () => {
        const data = await fetchComments(id);
        setComments(data);
    }, [id]);

    const loadIncident = useCallback(async () => {
        try {
            dispatch(setIncidentLoading(true));

            const data = await fetchIncidentById(id);

            dispatch(setSelectedIncident(data));
        } catch (error) {
            dispatch(setIncidentError(error.message));
        }
    }, [id, dispatch]);

    const handleCommentAdded = (newComment) => {
        setComments((prev) => {
            if (
                prev.some(
                    (comment) =>
                        comment._id ===
                        newComment._id
                )
            ) {
                return prev;
            }

            return [newComment, ...prev];
        });
    };

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            await loadIncident();
            if (!isMounted) return;
            await loadComments();

            const socket =
                getSocket() ||
                connectSocket();

            socket.emit("joinIncident", id);
        };

        init();

        return () => {
            isMounted = false;
        };
    }, [id, loadIncident, loadComments]);

    useEffect(() => {
        const socket = getSocket();

        if (!socket) return;

        const handleStatusChanged = (
            updatedIncident
        ) => {
            dispatch(
                setSelectedIncident(
                    updatedIncident
                )
            );
        };

        const handleAIAnalyzed = (
            updatedIncident
        ) => {
            dispatch(
                setSelectedIncident(
                    updatedIncident
                )
            );
        };

        const handleAssigned = (
            updatedIncident
        ) => {
            dispatch(
                setSelectedIncident(
                    updatedIncident
                )
            );
        };

        const handleIncidentRefresh = (
            updatedIncident
        ) => {
            if (
                updatedIncident?._id === id
            ) {
                dispatch(
                    setSelectedIncident(
                        updatedIncident
                    )
                );
            }
        };

        socket.on(
            "incident:statusUpdated",
            handleStatusChanged
        );

        socket.on(
            "incident:aiQueued",
            handleAIAnalyzed
        );
        socket.on(
            "incident:aiProcessing",
            handleAIAnalyzed
        );
        socket.on(
            "incident:aiCompleted",
            handleAIAnalyzed
        );
        socket.on(
            "incident:aiFailed",
            handleAIAnalyzed
        );
        socket.on(
            "incident:aiAnalyzed",
            handleAIAnalyzed
        );

        socket.on(
            "incident:assigned",
            handleAssigned
        );
        socket.on(
            "incident:slaBreached",
            handleIncidentRefresh
        );
        socket.on(
            "incident:severityEscalated",
            handleIncidentRefresh
        );
        socket.on(
            "incident:aiSummaryGenerated",
            handleIncidentRefresh
        );

        // comments
        const handleCommentAddedLocal = (comment) => handleCommentAdded(comment);
        socket.on("comment:added", handleCommentAddedLocal);

        return () => {
            socket.off(
                "incident:statusUpdated",
                handleStatusChanged
            );

            socket.off(
                "incident:aiQueued",
                handleAIAnalyzed
            );
            socket.off(
                "incident:aiProcessing",
                handleAIAnalyzed
            );
            socket.off(
                "incident:aiCompleted",
                handleAIAnalyzed
            );
            socket.off(
                "incident:aiFailed",
                handleAIAnalyzed
            );
            socket.off(
                "incident:aiAnalyzed",
                handleAIAnalyzed
            );

            socket.off(
                "incident:assigned",
                handleAssigned
            );
            socket.off(
                "incident:slaBreached",
                handleIncidentRefresh
            );
            socket.off(
                "incident:severityEscalated",
                handleIncidentRefresh
            );
            socket.off(
                "incident:aiSummaryGenerated",
                handleIncidentRefresh
            );

            socket.off("comment:added", handleCommentAddedLocal);
        };
    }, [dispatch, id]);

    if (
        loading ||
        !selectedIncident
    ) {
        return (
            <div>Loading incident...</div>
        );
    }

    const normalizedRole =
        currentUser?.role?.toUpperCase?.() ||
        "";
    const isAssignedEngineer =
        normalizedRole === "ENGINEER" &&
        selectedIncident.assignedTo?._id ===
            currentUser?._id;
    const canComment =
        normalizedRole !== "ENGINEER" ||
        isAssignedEngineer;
    const commentHelperText =
        canComment
            ? ""
            : "Engineers can only comment on incidents assigned to them.";

    return (
        <div className="space-y-6">
            <IncidentHeader
                incident={selectedIncident}
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Left */}
                <div className="space-y-6 xl:col-span-2">
                    <AISummaryCard
                        incident={selectedIncident}
                    />

                    <TimelineCard
                        timeline={
                            selectedIncident.timeline
                        }
                    />

                    <CommentsCard comments={comments} />

                    <CommentInput
                        incidentId={id}
                        onCommentAdded={
                            handleCommentAdded
                        }
                        disabled={!canComment}
                        helperText={
                            commentHelperText
                        }
                    />
                </div>

                {/* Right */}
                <div className="space-y-6">
                    <IncidentAssignmentCard
                        incident={selectedIncident}
                        currentUser={
                            currentUser
                        }
                        onAssigned={
                            loadIncident
                        }
                    />
                    <IncidentActions
                        incident={selectedIncident}
                        currentUser={
                            currentUser
                        }
                        refreshIncident={
                            loadIncident
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default IncidentDetails;
