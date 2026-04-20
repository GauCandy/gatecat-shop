import pg from "pg";

pg.types.setTypeParser(20, (val) => parseInt(val, 10));

const globalForPool = globalThis as unknown as { pool?: pg.Pool };

export const pool =
  globalForPool.pool ??
  new pg.Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;
