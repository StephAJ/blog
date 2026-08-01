import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import * as schema from "./schema";

const dbPath = path.resolve(
  process.cwd(),
  process.env.DATABASE_PATH ?? "./data/blog.db",
);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Next.js dev server re-evaluates modules on every hot reload; keep one handle.
const globalForDb = globalThis as unknown as {
  __sqlite?: Database.Database;
};

const sqlite = globalForDb.__sqlite ?? new Database(dbPath);

if (!globalForDb.__sqlite) {
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("synchronous = NORMAL");
  globalForDb.__sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export { schema, sqlite };
