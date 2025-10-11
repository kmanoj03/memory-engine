import { Router } from "express";
const r = Router();
r.post("/", (_req, res) => res.json({ results: [] })); // TEMP
export default r;
