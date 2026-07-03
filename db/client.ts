import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Drizzle connection over the transaction-mode pooler. `prepare: false` is
 * required because that pooler (PgBouncer) does not support prepared
 * statements. This connects directly to Postgres and bypasses RLS, so every
 * query must be scoped by `user_id` in the service layer.
 *
 * The postgres client is cached on `globalThis` in development so Next's hot
 * reload reuses one connection pool instead of leaking a new one per reload.
 */
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

export const client =
  globalForDb.client ?? postgres(process.env.DATABASE_URL!, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
