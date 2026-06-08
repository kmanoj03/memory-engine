# Memory Engine

> A memory layer for engineering teams. Paste a production error and instantly recall *how it was fixed last time* — with the diff, the service context, and an explanation of why the match is trustworthy.

Memory Engine turns one-off incident resolutions into a permanent, searchable knowledge base. It uses semantic embeddings + MongoDB Atlas Vector Search + a custom hybrid re-ranker so that the next on-call engineer doesn't have to rediscover a fix that already exists somewhere in Slack, Jira, or a senior engineer's head.

---

## Why this project

Most engineering teams have a "tribal knowledge" problem:

- The same class of bug is fixed 3–4 times across a year by different people.
- Stack traces look slightly different each time (line numbers shift, file paths change, versions bump), so naive text search misses them.
- Postmortems get written, then buried.

**Goal of Memory Engine:** make every resolved incident a first-class, reusable asset — retrievable by *meaning*, not by exact string match — and shorten time-to-resolution for repeat or "near-repeat" incidents.

| Stakeholder         | What they get                                                       |
|---------------------|---------------------------------------------------------------------|
| On-call engineer    | A ranked list of similar past incidents + the exact patch that fixed each one. |
| Engineering manager | A growing knowledge base; less dependence on individual experts.    |
| New hires           | A self-serve "how do we fix X here?" tool from day one.             |
| Platform / SRE      | A structured incident store with per-service, per-env recall.       |

---

## What it does (the user-facing story)

The product has two surfaces, modeled directly after the on-call workflow:

### 1. Search Memories (Read path)
Paste an error message and stack trace, optionally hint the service/env/version, and the engine returns the top-K most similar **resolved** incidents — each with:
- A similarity score (0–1 cosine, boosted by metadata matches).
- A **"why matched"** breakdown (e.g. `cosine:0.78  +service  +env  +tags:2`) so the user understands *why* this is being suggested, not just *that* it is.
- The original error, the **fix summary**, and the **patch diff** that resolved it.

### 2. Resolve Incidents (Write path)
Unresolved incidents are listed in a triage table. When an engineer closes one, they document:
- Root cause
- Fix summary
- Patch diff

This is then re-embedded and written back into MongoDB. The memory grows every time a bug is solved.

The two flows together form a closed loop: **every resolved incident makes the next search smarter.**

---

## How it works (architecture)

```
                ┌─────────────────────────────────────────────────────────┐
                │                      Client (React)                     │
                │   Search Memories tab        Resolve Incidents tab      │
                └────────────────┬───────────────────────┬────────────────┘
                                 │                       │
                          POST /search            POST /ingest
                          POST /resolve/:id       GET  /incidents
                                 │                       │
                ┌────────────────▼───────────────────────▼────────────────┐
                │                    Express + TypeScript API             │
                │                                                         │
                │   normalizeTrace → buildErrorFingerprint → embed →      │
                │   Atlas $vectorSearch → drop self-hit → hybrid rank     │
                └────────────────┬────────────────────┬───────────────────┘
                                 │                    │
                          Voyage AI                MongoDB Atlas
                       (voyage-3.5-lite,           (incidents collection
                        1024-dim embeddings)        + vector_index)
```

### The recall pipeline (what happens on every search)
1. **Normalize** the stack trace — strip line/column numbers and hex addresses so `TypeError at foo.ts:45:12` and `TypeError at foo.ts:51:9` collapse to the same shape.
2. **Build a structured signal** — `[service] [env] [version] [file] [function] ERROR: … TRACE: … TAGS: …`. This is what gets embedded, not the raw error.
3. **Embed** the signal with `voyage-3.5-lite` (1024-dim).
4. **Atlas Vector Search** finds the nearest candidates (top 50, then narrowed). Optional pre-filters on `service` and `env`.
5. **Self-hit removal** — fingerprint the query and drop any candidate with the same SHA-1 signature so we never recommend the bug you just pasted.
6. **Hybrid re-rank** — cosine similarity is the base; we add interpretable boosts:
   - same `service` → **+0.30**
   - same `env` → **+0.20**
   - close `version` (same major, minor within ±2) → **+0.10**
   - overlapping tags → **+0.05 each, capped at +0.15**
7. **Explain** — every boost is recorded and returned in `whyMatched`, so the UI can show *why* a match is suggested.

This last point matters: the system is **transparent by design**. It never gives a black-box ranking.

---

## Tech stack

| Layer            | Choice                                  | Why                                                                 |
|------------------|------------------------------------------|---------------------------------------------------------------------|
| Embeddings       | Voyage AI `voyage-3.5-lite` (1024-dim)   | Strong code/error semantics, fast, cheaper than OpenAI for this use |
| Vector DB        | MongoDB Atlas Vector Search              | One database for vectors + metadata + filters — no separate store   |
| API              | Express 5 + TypeScript                   | Familiar, fast to iterate, typed end-to-end                         |
| Frontend         | React 18 + TypeScript + Vite + Tailwind  | Snappy DX, type-safe API contracts shared in spirit with the server |
| UX polish        | Framer Motion, Lucide, React Hot Toast   | Lightweight, accessible motion + iconography                        |
| Indexing         | Compound indexes on `(service, env, version_bucket, created_at)`, `(error_type, tags)`, `created_at` | Keeps metadata-only queries cheap; vector search handles the rest |

---

## Repository layout

```
memory-engine/
├── server/                      # Express + TypeScript API
│   ├── app.ts                   # Route mounting (/search, /ingest, /resolve, /incidents)
│   ├── server.ts                # Boot + index creation
│   ├── handlers/
│   │   ├── searchHandler.ts     # Vector search + hybrid rank + self-hit filter
│   │   ├── ingestHandler.ts     # Fingerprint → embed → upsert
│   │   ├── resolveHandler.ts    # Attach fix_summary / patch_diff → mark resolved
│   │   └── incidentHandler.ts   # List incidents (resolved | unresolved)
│   ├── utils/
│   │   ├── normalizeTrace.ts    # Strip noise from stack traces
│   │   ├── buildErrorFingerprint.ts  # Build the embedding input
│   │   ├── generateIncidentEmbedding.ts  # Voyage AI client
│   │   ├── ranking.ts           # Hybrid re-ranker w/ explainability
│   │   ├── fingerprint.ts       # SHA-1 dedupe signature
│   │   └── mongo.ts             # Connection + collection helpers
│   ├── models/incident.ts       # Typed Incident + SearchRequest contracts
│   └── routes/                  # Thin route → handler wiring
│
└── client/                      # React + TypeScript + Vite + Tailwind
    └── src/
        ├── components/
        │   ├── Search/          # SearchPage, SearchForm, ResultCard, PatchDiffModal, WhyMatchedChip
        │   ├── Resolve/         # ResolvePage, UnresolvedTable, IncidentDetailModal, MarkResolvedForm
        │   ├── Layout/          # Header + tab nav
        │   └── shared/          # Button, EmptyState, LoadingSpinner, HelpTour, KeyboardShortcutsModal
        ├── hooks/               # useSearch, useIncidents, useToast, useKeyboardShortcuts
        └── services/            # api.ts (axios client) + types.ts (shared contracts)
```

---

## API reference

All endpoints are JSON. Base URL: `http://localhost:3000`.

| Method | Path              | Purpose                                                              |
|--------|-------------------|----------------------------------------------------------------------|
| GET    | `/ping`           | Liveness check.                                                      |
| GET    | `/test-db`        | Confirms Mongo connectivity + returns incident count.                |
| POST   | `/ingest`         | Upsert a new incident. Computes fingerprint + embedding.             |
| POST   | `/search`         | Returns top-K ranked similar incidents with explainability.          |
| POST   | `/resolve/:id`    | Attach `fix_summary`, `patch_diff`, `resolved_by`. Marks resolved.   |
| GET    | `/incidents`      | List incidents. `?resolved=true|false` (default `false`).            |

### Example: `POST /search`

```json
{
  "error_message": "TypeError: Cannot read properties of undefined (reading 'token')",
  "stack_trace": "at AuthService.verify (auth.ts:142:9)\n at ...",
  "service": "auth-service",
  "env": "prod",
  "version": "v2.3.1",
  "tags": ["TypeError", "auth"],
  "topK": 5
}
```

Response (truncated):

```json
{
  "results": [
    {
      "id": "65f...",
      "score": 1.18,
      "whyMatched": ["cosine:0.78", "+service", "+env", "+tags:2"],
      "error_message": "TypeError: Cannot read properties of undefined (reading 'token')",
      "fix_summary": "Added null-check on session before reading token",
      "patch_diff": "--- a/auth.ts\n+++ b/auth.ts\n@@ ...",
      "service": "auth-service",
      "env": "prod",
      "version": "v2.3.0"
    }
  ]
}
```

---

## Engineering decisions worth calling out

These are the small choices that make the system feel grown-up, not a toy:

1. **Embed a structured signal, not the raw error.** Including service/env/version/tags inside the embedded text gives the model "soft" context it can use semantically — on top of the "hard" boosts the re-ranker applies afterward.
2. **Normalize before fingerprinting.** Two incidents whose only difference is `auth.ts:142:9` vs `auth.ts:151:4` are the same incident. The normalizer collapses both before the SHA-1.
3. **Drop self-hits explicitly.** Without this, freshly ingested incidents would always rank #1 against themselves. The fingerprint check makes the system safe to use on a query that has already been written to memory.
4. **Explainable ranking.** Every boost is logged into `whyMatched`. There is no opaque magic number — the UI surfaces exactly why a result is being recommended.
5. **Hybrid > pure vector.** Pure cosine similarity sometimes returns a same-error-different-service match. Adding metadata boosts pulls the right-service match to the top, which is what an on-call engineer actually wants.
6. **One database, two access patterns.** Atlas holds vectors *and* metadata. The server uses compound indexes for cheap metadata queries and the `vector_index` for ANN search — no second datastore to operate.

---

## Setup

### Prerequisites
- Node.js 20+
- A MongoDB Atlas cluster with a `vector_index` (cosine, 1024 dims) on the `incidents.vector` field
- A Voyage AI API key

### Server

```bash
cd server
npm install
cat > .env <<'EOF'
MONGODB_URI=<your-atlas-uri>
MONGODB_DB=memory_engine
MONGODB_COLLECTION=incidents
VOYAGE_API_KEY=<your-voyage-key>
VOYAGE_MODEL=voyage-3.5-lite
PORT=3000
EOF
npm run dev
```

Server boots at `http://localhost:3000` and ensures indexes on first run.

### Client

```bash
cd client
npm install
npm run dev
```

Opens at `http://localhost:5173` and talks to the server at `localhost:3000`.

### Sanity check

```bash
curl http://localhost:3000/ping        # → { "ok": true }
curl http://localhost:3000/test-db     # → { "ok": true, "count": N }
```

---

## Roadmap

Near-term work I'd prioritize, in order:

1. **Auto-ingest from real sources.** Hook into Sentry / Datadog / GitHub Actions failure webhooks so memory grows without manual entry.
2. **Resolution quality signals.** Track how often a suggested fix is actually applied vs dismissed → use as a re-ranking signal.
3. **LLM summary on top.** Once top-K is returned, generate a one-paragraph "here's what's probably wrong and what fixed it last time" answer grounded in the retrieved incidents (RAG, not freeform).
4. **Service ownership + routing.** Map services to teams so an unresolved incident can be auto-assigned.
5. **Eval harness.** Build a labeled set of (query, ideal match) pairs and track recall@5 / MRR as we tune the ranker.
6. **Auth + multi-tenant.** Required before this is usable in a real org.

---

## Status

Working end-to-end: ingest → embed → store → semantic search → hybrid rank → resolve → re-embed. Built initially as a hackathon project and being extended into a more general-purpose engineering memory layer.

The interesting parts to read first if you're evaluating this for an AI internship:

- [`server/handlers/searchHandler.ts`](server/handlers/searchHandler.ts) — the recall pipeline end-to-end.
- [`server/utils/ranking.ts`](server/utils/ranking.ts) — the explainable hybrid re-ranker.
- [`server/utils/normalizeTrace.ts`](server/utils/normalizeTrace.ts) + [`server/utils/buildErrorFingerprint.ts`](server/utils/buildErrorFingerprint.ts) — the pre-embedding pipeline that makes retrieval actually work.
- [`server/utils/generateIncidentEmbedding.ts`](server/utils/generateIncidentEmbedding.ts) — Voyage integration with strict dimension validation.
