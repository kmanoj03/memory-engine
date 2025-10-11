import { Router } from "express";
import { listIncidentsHandler } from "../handlers/incidentHandler";
const r = Router();
r.get("/", listIncidentsHandler);
export default r;
