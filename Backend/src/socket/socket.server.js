import { Server } from "socket.io";

let io;

export const initSocketServer = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
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