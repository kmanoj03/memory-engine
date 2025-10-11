import { MongoClient, Db, Collection } from "mongodb";
import type { Incident } from "../models/incident";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    throw new Error("Missing MONGODB_URI or MONGODB_DB in environment.");
  }

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  console.log(`Connected to MongoDB database: ${dbName}`);
  return db;
}

export async function getIncidentsCollection(): Promise<Collection<Incident>> {
  const d = await getDb();

  const collectionName = process.env.MONGODB_COLLECTION || "incidents";
  return d.collection<Incident>(collectionName);
}
