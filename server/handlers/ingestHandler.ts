// Without ingestion, your memory engine would have no memory
// It fingerprints each error, normalizes and embeds it semantically, and stores it once — ready for future recall.
// Together with searchHandler, it completes the “Read/Write” loop of your intelligent debugging memory.

import { Request, Response } from "express";
import { getIncidentsCollection } from "../utils/mongo";
import { generateIncidentEmbedding } from "../utils/generateIncidentEmbedding";
import { normalizeTrace } from "../utils/normalizeTrace";
import crypto from "crypto";

function fingerprint(msg: string, trace = "") {
  return crypto
    .createHash("sha1")
    .update(msg + "\n" + normalizeTrace(trace))
    .digest("hex");
}

export async function ingestHandler(req: Request, res: Response) {
  const body = req.body as any;
  try {
    const fp = fingerprint(body.error_message, body.stack_trace);
    const signal = [
      `[service]=${body.service} [env]=${body.env} [version]=${body.version}`,
      `ERROR: ${body.error_message}`,
      `TRACE:\n${normalizeTrace(body.stack_trace ?? "", 20)}`,
      `TAGS: ${(body.tags ?? []).join(",")}`,
    ].join("\n");

    const vector = await generateIncidentEmbedding(signal);
    const coll = await getIncidentsCollection();
    const created_at = new Date().toISOString();

    const result = await coll.updateOne(
      { fingerprint: fp },
      {
        $setOnInsert: { created_at, resolved: false },
        $set: { ...body, fingerprint: fp, vector },
      },
      { upsert: true }
    );

    res.json({
      ok: true,
      id: result.upsertedId ? String(result.upsertedId) : undefined,
      fingerprint: fp,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
