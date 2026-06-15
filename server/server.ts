// server/server.ts
import "dotenv/config";
import { app } from "./app";
import { getDb } from "./utils/mongo";

// (optional) create indexes on first boot
async function ensureIndexes() {
  const db = await getDb();
  const col = db.collection("incidents");

  await Promise.all([
    col.createIndex({ service: 1, env: 1, version_bucket: 1, created_at: -1 }),
    col.createIndex({ error_type: 1, tags: 1 }),
    col.createIndex({ created_at: -1 }),
    // optional text fallback:
    // col.createIndex({ error_message: "text", root_cause: "text", fix_summary: "text" }),
  ]);

  console.log("Mongo indexes ensured");
}

async function main() {
  // touch DB (and log once connected)
  await getDb();
  await ensureIndexes();

  const PORT = Number(process.env.PORT ?? 3000);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

//test comment
