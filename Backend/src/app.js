import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import incidentRoutes from "./modules/incident/incident.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import testRoutes from "./modules/test/test.routes.js";
import monitoringRoutes from './modules/monitoring/monitoring.routes.js';



const app = express();

// Allow frontend to send/receive cookies
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/test', testRoutes);
app.use('/api/monitoring', monitoringRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Incident Response Platform API",
  });
});

// Error handler should be registered after routes
app.use(errorMiddleware);

export default app;