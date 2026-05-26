import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { redisConnection } from "./src/config/redis.js";

import {
  initSocketServer,
} from "./src/socket/socket.server.js";

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

initSocketServer(server);

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});