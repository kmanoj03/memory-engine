import { Request, Response } from "express";
import { getIncidentsCollection } from "../utils/mongo.js";

export async function listIncidentsHandler(req: Request, res: Response) {
  const resolved = (req.query.resolved ?? "false") === "true";
  const coll = await getIncidentsCollection();
  const docs = await coll
    .find({ resolved })
    .sort({ created_at: -1 })
    .limit(100)
    .toArray();

  res.json({
    incidents: docs.map(({ _id, vector, ...rest }) => ({
      id: String(_id),
      ...rest,
    })),
  });
}
