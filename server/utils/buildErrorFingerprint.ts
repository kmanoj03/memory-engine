// This piece of code creates a normalized, metadata-rich, human-readable text version of the error signal.
// It’s what the memory engine “reads” and “remembers

import type { SearchRequest } from "../models/incident";
import { normalizeTrace } from "./normalizeTrace.js";

export function buildErrorFingerprint(
  p: SearchRequest & { file?: string; function?: string }
): string {
  const tags = (p.tags ?? []).join(",");
  return `[service]=${p.service ?? "unknown"} [env]=${
    p.env ?? "unknown"
  } [version]=${p.version ?? "?"}
[file]=${p.file ?? "?"} [function]=${p.function ?? "?"}
ERROR: ${p.error_message}
TRACE:
${normalizeTrace(p.stack_trace ?? "", 20)}
TAGS: ${tags}`;
}
