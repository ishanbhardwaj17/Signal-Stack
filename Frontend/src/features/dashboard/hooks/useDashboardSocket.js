import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
    connectSocket,
} from "../../../shared/services/socket.service";

import {
    addLiveIncident,
} from "../../incidents/state/incident.slice";

export default function useDashboardSocket() {
    const dispatch = useDispatch();

    useEffect(() => {
        const socket = connectSocket();

        const handleCreated = (incident) => {
            dispatch(
                addLiveIncident({
                    type: "CREATED",
                    incident,
                    timestamp: new Date().toISOString(),
                })
            );
        };

        const handleEscalated = (incident) => {
            dispatch(
                addLiveIncident({
                    type: "ESCALATED",
                    incident,
                    timestamp: new Date().toISOString(),
                })
            );
        };

        const handleSlaBreached = (incident) => {
            dispatch(
                addLiveIncident({
                    type: "SLA_BREACHED",
                    incident,
                    timestamp: new Date().toISOString(),
                })
            );
        };

        const handleAiSummaryGenerated = (
            incident
        ) => {
            dispatch(
                addLiveIncident({
                    type: "AI_SUMMARY",
                    incident,
                    timestamp: new Date().toISOString(),
                })
            );
        };

        socket.on(
            "dashboard:incidentCreated",
            handleCreated
        );
        socket.on(
            "incident:created",
            handleCreated
        );

        socket.on(
            "dashboard:severityEscalated",
            handleEscalated
        );
        socket.on(
            "incident:severityEscalated",
            handleEscalated
        );

        socket.on(
            "dashboard:slaBreached",
            handleSlaBreached
        );
        socket.on(
            "incident:slaBreached",
            handleSlaBreached
        );

        socket.on(
            "dashboard:aiSummaryGenerated",
            handleAiSummaryGenerated
        );
        socket.on(
            "incident:aiSummaryGenerated",
            handleAiSummaryGenerated
        );

        return () => {
            socket.off(
                "dashboard:incidentCreated",
                handleCreated
            );
            socket.off(
                "incident:created",
                handleCreated
            );

            socket.off(
                "dashboard:severityEscalated",
                handleEscalated
            );
            socket.off(
                "incident:severityEscalated",
                handleEscalated
            );

            socket.off(
                "dashboard:slaBreached",
                handleSlaBreached
            );
            socket.off(
                "incident:slaBreached",
                handleSlaBreached
            );

            socket.off(
                "dashboard:aiSummaryGenerated",
                handleAiSummaryGenerated
            );
            socket.off(
                "incident:aiSummaryGenerated",
                handleAiSummaryGenerated
            );
        };
    }, [dispatch]);
}