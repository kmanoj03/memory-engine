import express from "express";
import cors from "cors";
import searchRoutes from "./routes/searchRoutes";
import ingestRoutes from "./routes/ingestRoutes";
import resolveRoutes from "./routes/resolveRoutes";
import incidentsRoutes from "./routes/incidentRoutes";
import { getDb } from "./utils/mongo";

export const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/ping", (_req, res) => res.json({ ok: true }));

app.use("/search", searchRoutes);
app.use("/ingest", ingestRoutes);
app.use("/resolve", resolveRoutes);
app.use("/incidents", incidentsRoutes);

app.get("/test-db", async (_req, res) => {
  const db = await getDb();
  const count = await db.collection("incidents").countDocuments();
  res.json({ ok: true, count });
});
