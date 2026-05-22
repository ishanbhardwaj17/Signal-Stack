import express from "express";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import incidentRoutes from "./modules/incident/incident.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Incident Response Platform API",
  });
});

// Error handler should be registered after routes
app.use(errorMiddleware);

export default app;