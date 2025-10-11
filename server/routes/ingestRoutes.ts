import { Router } from "express";
import { ingestHandler } from "../handlers/ingestHandler";
const r = Router();
r.post("/", ingestHandler);
export default r;
