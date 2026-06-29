import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import {
    connectSocket,
} from "../../../shared/services/socket.service";

import {
    addLiveIncident,
} from "../../incidents/state/incident.slice";

export default function useDashboardSocket({
    onIncidentActivity,
} = {}) {
    const dispatch = useDispatch();
    const refreshTimerRef = useRef(null);
    const incidentActivityRef =
        useRef(onIncidentActivity);

    useEffect(() => {
        incidentActivityRef.current =
            onIncidentActivity;
    }, [onIncidentActivity]);

    useEffect(() => {
        const socket = connectSocket();

        const handleLiveFeedEvent = (event) => {
            dispatch(
                addLiveIncident(event)
            );

            if (refreshTimerRef.current) {
                clearTimeout(
                    refreshTimerRef.current
                );
            }

            refreshTimerRef.current =
                window.setTimeout(() => {
                    incidentActivityRef.current?.(
                        event
                    );
                }, 900);
        };

        socket.on("incident:feed", handleLiveFeedEvent);

        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(
                    refreshTimerRef.current
                );
            }
            socket.off("incident:feed", handleLiveFeedEvent);
        };
    }, [dispatch]);
}
