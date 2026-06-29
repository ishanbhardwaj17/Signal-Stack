import { redisConnection } from "../config/redis.js";
import { getIO } from "./socket.server.js";

export const emitSocketEvent = (
    eventName,
    payload,
    options = {}
) => {
    const { room } = options;

    try {
        const io = getIO();

        if (room) {
            io.to(room).emit(eventName, payload);
            return;
        }

        io.emit(eventName, payload);
        return;
    } catch {
        // Socket server is not initialized in background workers, so
        // publish through Redis and let the API server relay it.
    }

    if (!redisConnection) {
        return;
    }

    redisConnection.publish(
        "socket-events",
        JSON.stringify({
            eventName,
            payload,
            room: room || null,
        })
    );
};
