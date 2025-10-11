import { Router } from "express";
import { resolveHandler } from "../handlers/resolveHandler";
const r = Router();
r.post("/:id", resolveHandler);
export default r;
