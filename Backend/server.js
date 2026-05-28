import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { redisConnection } from "./src/config/redis.js";
import { monitoringQueue } from './src/queues/monitoring.queue.js';
import {  initSocketServer} from "./src/socket/socket.server.js";

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

initSocketServer(server);

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});

// Handle listen errors (e.g. port already in use)
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port or set PORT to a different value.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

console.log(monitoringQueue.name);