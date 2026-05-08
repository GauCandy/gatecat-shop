import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, "..", "db", "migrations");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS _schema_migrations (
       name        TEXT PRIMARY KEY,
       applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
     )`
  );

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows } = await pool.query("SELECT name FROM _schema_migrations");
  const applied = new Set(rows.map((r) => r.name));

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    process.stdout.write(`▸ ${file} … `);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO _schema_migrations (name) VALUES ($1)", [
        file,
      ]);
      await client.query("COMMIT");
      console.log("ok");
      count++;
    } catch (err) {
      await client.query("ROLLBACK");
      console.log("FAILED");
      console.error(err);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  if (count === 0) console.log("Nothing to migrate.");
  else console.log(`Applied ${count} migration(s).`);
}

try {
  await main();
} finally {
  await pool.end();
}
