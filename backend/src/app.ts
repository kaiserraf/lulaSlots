import express from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import gameRoutes from "./routes/gameRoutes";
import rewardRoutes from "./routes/rewardRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/users", userRoutes);

app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada." }));
app.use(errorHandler);

export default app;