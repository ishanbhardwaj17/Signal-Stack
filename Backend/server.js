import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { redisConnection } from "./src/config/redis.js";
import { monitoringQueue } from './src/queues/monitoring.queue.js';
import {  initSocketServer} from "./src/socket/socket.server.js";
import { initMonitoringWorker } from "./src/workers/monitoring.worker.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const startServer = async () => {
  await connectDB();

  initSocketServer(server);
  initMonitoringWorker();

  server.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    );
  });

  console.log(monitoringQueue.name);
};

// Handle listen errors (e.g. port already in use)
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port or set PORT to a different value.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

startServer().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
