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

        const handleLiveFeedEvent = (event) => {
            dispatch(
                addLiveIncident(event)
            );
        };

        socket.on("incident:feed", handleLiveFeedEvent);

        return () => {
            socket.off("incident:feed", handleLiveFeedEvent);
        };
    }, [dispatch]);
}
