// It takes a fresh error, turns it into meaning, finds the closest memories, and explains why they match.
import { Request, Response } from "express";
import type { SearchRequest } from "../models/incident";

import { getIncidentsCollection } from "../utils/mongo.js";
import { buildErrorFingerprint } from "../utils/buildErrorFingerprint";
import { generateIncidentEmbedding } from "../utils/generateIncidentEmbedding";
import { computeHybridRank } from "../utils/ranking.js";

export async function searchHandler(req: Request, res: Response) {
  const body = (req.body || {}) as SearchRequest;

  try {
    // 1) Build semantic signature and embed
    const signal = buildErrorFingerprint(body);
    const qvec = await generateIncidentEmbedding(signal);

    // 2) Prepare optional metadata pre-filter
    const preFilter: Record<string, any> = {};
    if (body.service) preFilter.service = body.service;
    if (body.env) preFilter.env = body.env;
    // (You can add version/tag prefilters later if you want to narrow harder)

    const col = await getIncidentsCollection();

    // Build the vectorSearch stage without undefined props
    const vectorStage: any = {
      $vectorSearch: {
        index: "default",
        path: "vector",
        queryVector: qvec,
        numCandidates: Math.min(100, 50), // cap to control latency; tune as you like
        limit: Math.min(20, body.topK ?? 20),
      },
    };
    if (Object.keys(preFilter).length) {
      vectorStage.$vectorSearch.filter = preFilter;
    }

    // 3) Query Atlas Vector Search
    const agg = await col
      .aggregate<any>([
        vectorStage,
        {
          $project: {
            _id: 1,
            error_message: 1,
            fix_summary: 1,
            patch_diff: 1,
            service: 1,
            env: 1,
            version: 1,
            tags: 1,
            file: 1,
            function: 1,
            vectorScore: { $meta: "vectorSearchScore" },
          },
        },
      ])
      .toArray();

    // 4) Hybrid ranking (semantic + metadata boosts) + explainability
    const topK = Math.min(10, body.topK ?? 5);
    const ranked = agg
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
