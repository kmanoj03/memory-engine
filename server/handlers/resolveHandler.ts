// This handler is the “incident resolution” endpoint — it’s how the system learns closure.
// It’s what turns a raw memory (an incident record) into actionable knowledge that can help the next time that bug appears.
// Our Engine says, “I’ve seen this before and I know how we fixed it.”

// handlers/resolve.handler.ts
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getIncidentsCollection } from "../utils/mongo.js";

export async function resolveHandler(req: Request, res: Response) {
  const { id } = req.params;
  const { fix_summary, patch_diff, resolved_by } = req.body as {
    fix_summary?: string;
    patch_diff?: string;
    resolved_by?: string;
  };

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid incident id" });
    }

    const col = await getIncidentsCollection();
    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          fix_summary,
          patch_diff,
          resolved_by,
          resolved: true,
          resolved_at: new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Incident not found" });
    }

    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
