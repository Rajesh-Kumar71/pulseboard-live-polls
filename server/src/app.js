import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "PulseBoard API is running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Route not found",
  });
});

export default app;