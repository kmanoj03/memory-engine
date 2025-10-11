//This code does the job of error fingerprint sanitizer.

export function normalizeTrace(trace = "", maxFrames = 20): string {
  // 1️⃣ Split the stack trace into lines
  const lines = trace
    .split("\n")

    // 2️⃣ Remove noisy details like (file.ts:45:18)
    .map(
      (l) =>
        l
          .replace(/\(.*?:\d+:\d+\)/g, "(...)") // e.g., turns (charges.ts:45:18) → (...)
          .replace(/0x[0-9a-f]+/gi, "0x...") // turns memory addresses into 0x...
    )

    // 3️⃣ Drop empty lines
    .filter(Boolean)

    // 4️⃣ Keep only top N frames (default 20)
    .slice(0, maxFrames);

  // 5️⃣ Rejoin into a clean, normalized trace
  return lines.join("\n");
}
