import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | null = null;
let pool: Pool | null = null;
let dbAvailable = false;

export function getDb() {
  if (!instance) {
    if (!env.databaseUrl) {
      console.error("[DB] DATABASE_URL not set — database unavailable");
      throw new Error("DATABASE_URL is not configured");
    }

    try {
      pool = new Pool({
        connectionString: env.databaseUrl,
        ssl: { rejectUnauthorized: false },
      });

      instance = drizzle(pool, { schema: fullSchema });
      dbAvailable = true;
    } catch (err: any) {
      console.error("[DB] Failed to connect:", err.message);
      dbAvailable = false;
      throw err;
    }
  }
  return instance;
}

export function isDbAvailable() {
  return dbAvailable;
}

export function getPool() {
  return pool;
}

/**
 * Proactively initialise the DB connection at server startup.
 * Without this, `isDbAvailable()` always returns false until the first
 * request that calls `getDb()` — meaning every router's guard is wrong
 * even when DATABASE_URL is correctly set.
 */
export function tryInitDb(): void {
  if (dbAvailable || !env.databaseUrl) return;
  try {
    getDb();
    console.log("[DB] Connected successfully");
  } catch (err: unknown) {
    console.error("[DB] Startup connection failed:", (err as Error).message);
  }
}
