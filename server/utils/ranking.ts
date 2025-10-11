// This is the intelligence layer that decides how much context matters with the help of pre-defined points for each tag.

export function computeHybridRank(
  cosine: number,
  q: { service?: string; env?: string; version?: string; tags?: string[] },
  d: { service?: string; env?: string; version?: string; tags?: string[] }
) {
  let s = cosine;
  const why = [`cosine:${cosine.toFixed(2)}`];
  if (q.service && d.service && q.service === d.service) {
    s += 0.3;
    why.push("+service");
  }
  if (q.env && d.env && q.env === d.env) {
    s += 0.2;
    why.push("+env");
  }
  if (q.version && d.version && isClose(q.version, d.version)) {
    s += 0.1;
    why.push("+version");
  }
  if (q.tags?.length && d.tags?.length) {
    const overlap = q.tags.filter((t) => d.tags!.includes(t)).length;
    if (overlap > 0) {
      s += Math.min(0.15, 0.05 * overlap);
      why.push(`+tags:${overlap}`);
    }
  }
  return { score: s, whyMatched: why };
}
function isClose(a: string, b: string) {
  const [ma, mi] = a.replace(/^v/, "").split(".").map(Number);
  const [mb, mj] = b.replace(/^v/, "").split(".").map(Number);
  return ma === mb && Math.abs((mi || 0) - (mj || 0)) <= 2;
}
