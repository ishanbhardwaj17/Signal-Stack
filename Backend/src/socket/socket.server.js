import { Server } from "socket.io";
import { redisConnection } from "../config/redis.js";
import Incident from "../modules/incident/incident.model.js";
import {
    getAuthenticatedUser,
} from "../middleware/auth.middleware.js";

let io;
let socketEventSubscriber;

export const initSocketServer = (server) => {
    io = new Server(server, {
        cors: {
            origin:
                process.env.FRONTEND_URL ||
                "http://localhost:5173",
            credentials: true,
        },
    });

    socketEventSubscriber = redisConnection.duplicate();

    socketEventSubscriber.subscribe("socket-events");

    socketEventSubscriber.on("message", (_, message) => {
        try {
            const parsedMessage = JSON.parse(message);

            if (!parsedMessage?.eventName) {
                return;
            }

            if (parsedMessage.room) {
                io.to(parsedMessage.room).emit(
                    parsedMessage.eventName,
                    parsedMessage.payload
                );
                return;
            }

            io.emit(
                parsedMessage.eventName,
                parsedMessage.payload
            );
        } catch (error) {
            console.log("Socket event relay failed");
        }
    });

    io.use(async (socket, next) => {
        try {
            const requestLike = {
                headers:
                    socket.handshake.headers,
            };

            socket.data.user =
                await getAuthenticatedUser(
                    requestLike
                );

            next();
        } catch (error) {
            next(
                new Error(
                    "Unauthorized socket connection"
                )
            );
        }
    });

    io.on("connection", (socket) => {
        console.log(
            `Socket Connected: ${socket.id}`
        );

        socket.on("joinIncident", async (incidentId) => {
            if (!incidentId) {
                socket.emit(
                    "socket:error",
                    {
                        message:
                            "Incident room ID is required",
                    }
                );
                return;
            }

            const incident =
                await Incident.findById(
                    incidentId
                ).select("_id");

            if (!incident) {
                socket.emit(
                    "socket:error",
                    {
                        message:
                            "Incident room not found",
                    }
                );
                return;
            }

            socket.join(incidentId);

            console.log(
                `Socket joined incident room: ${incidentId}`
            );
        });

        socket.on("disconnect", () => {
            console.log(
                `Socket Disconnected: ${socket.id}`
            );
        });
    });
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
};
