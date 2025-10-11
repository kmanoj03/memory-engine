import crypto from "crypto";
import { normalizeTrace } from "./normalizeTrace.js";

export function makeFingerprint(msg: string, trace = ""): string {
  return crypto
    .createHash("sha1")
    .update(msg + "\n" + normalizeTrace(trace, 20))
    .digest("hex");
}
