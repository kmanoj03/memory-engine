import { Router } from "express";
import { searchHandler } from "../handlers/searchHandler";
const r = Router();
r.post("/", searchHandler);
export default r;
