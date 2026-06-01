import { Server } from "socket.io";
import { redisConnection } from "../config/redis.js";

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

            io.emit(
                parsedMessage.eventName,
                parsedMessage.payload
            );
        } catch (error) {
            console.log("Socket event relay failed");
        }
    });

    io.on("connection", (socket) => {
        console.log(
            `Socket Connected: ${socket.id}`
        );

        socket.on("joinIncident", (incidentId) => {
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