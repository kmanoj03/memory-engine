// It takes a fresh error, turns it into meaning, finds the closest memories, and explains why they match.
// handlers/search.handler.ts

// I won’t suggest the thing you just pasted; here’s the closest prior fix I know. -> Recent Commit
import { Request, Response } from "express";
import type { SearchRequest } from "../models/incident";
import { getIncidentsCollection } from "../utils/mongo.js";
import { buildErrorFingerprint } from "../utils/buildErrorFingerprint.js";
import { generateIncidentEmbedding } from "../utils/generateIncidentEmbedding.js";
import { computeHybridRank } from "../utils/ranking.js";
import { makeFingerprint } from "../utils/fingerprint.js";

export async function searchHandler(req: Request, res: Response) {
  const body = (req.body || {}) as SearchRequest;

  try {
    // 1) Build semantic signature and embed
    const signal = buildErrorFingerprint(body);
    const qvec = await generateIncidentEmbedding(signal);

    // 👉 Compute the query fingerprint to drop self-hit
    const queryFp = makeFingerprint(body.error_message, body.stack_trace ?? "");

    // 2) Optional pre-filter
    const preFilter: Record<string, any> = {};
    if (body.service) preFilter.service = body.service;
    if (body.env) preFilter.env = body.env;

    const col = await getIncidentsCollection();

    const vectorStage: any = {
      $vectorSearch: {
        index: "vector_index",
        path: "vector",
        queryVector: qvec,
        numCandidates: Math.min(100, 50),
        limit: Math.min(20, body.topK ?? 20),
      },
    };
    if (Object.keys(preFilter).length) {
      vectorStage.$vectorSearch.filter = preFilter;
    }

    // 3) Query Atlas Vector Search (project fingerprint so we can filter)
    const agg = await col
      .aggregate<any>([
        vectorStage,
        {
          $project: {
            _id: 1,
            fingerprint: 1, // 👈 add this
            error_message: 1,
            fix_summary: 1,
            patch_diff: 1,
            service: 1,
            env: 1,
            version: 1,
            tags: 1,
            file: 1,
            function: 1,
            resolved: 1, // (optional) for later boosts
            resolved_at: 1, // (optional) for tie-breaker
            created_at: 1, // (optional) for tie-breaker
            vectorScore: { $meta: "vectorSearchScore" },
          },
        },
      ])
      .toArray();

    // 4) Drop self-hit, rank, slice
    const topK = Math.min(10, body.topK ?? 5);
    const ranked = agg
      .filter((d: any) => d.fingerprint !== queryFp) // 👈 self-hit gone
      .map((doc: any) => {
        const cosine = Number(doc.vectorScore) || 0;
        const { score, whyMatched } = computeHybridRank(cosine, body, doc);
        return {
          id: String(doc._id),
          score,
          whyMatched,
          ...doc,
        };
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, topK);

    res.json({ results: ranked });
  } catch (e: any) {
    console.error("searchHandler error:", e);
    res.status(500).json({ error: e.message ?? "Internal error" });
  }
}
