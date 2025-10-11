export type Env = "dev" | "staging" | "prod";

export interface Incident {
  _id?: string;

  // Identity & context
  fingerprint: string; // sha1(topFrames+message)
  service: string;
  env: Env;
  version: string; // e.g., "v2.3.1"
  version_bucket?: string; // e.g., "v2.3.x" (computed)
  error_type?: string; // e.g., "TypeError" (computed)
  language?: string;
  file?: string;
  function?: string;

  // Raw signal
  error_message: string;
  stack_trace?: string;

  // Derived tokens for lightweight scoring
  frame_tokens?: string[]; // ["payments/retry.connect","client.send"]
  message_tokens?: string[]; // ["typeerror","validation","null"]

  // Labels
  tags?: string[]; // ["TypeError","validation","null"]

  // Resolution (optional until fixed)
  root_cause?: string;
  fix_summary?: string;
  patch_diff?: string; // unified diff text
  files_touched?: string[];
  commit_sha?: string;
  resolved: boolean;
  resolved_at?: Date | string;
  resolved_by_fix_id?: string;

  // Infra
  vector?: number[]; // embedding; may be added post-insert
  source?: "manual" | "ci" | "runtime";
  ingest_notes?: string;

  created_at: Date | string;
}

export interface SearchRequest {
  error_message: string;
  stack_trace?: string;

  // Optional hints; engine should auto-detect if absent
  service?: string;
  env?: Env;
  version?: string;
  tags?: string[];

  topK?: number; // kept for your UI
  limit?: number; // alias; server may prefer this
}

// What you return to UI (don’t persist score/why)
export interface SearchMatch {
  incident: Incident;
  final_score: number;
  why_matched: string[]; // ["cosine:0.78","service:+0.30","env:+0.20","tags:+0.10"]
}
