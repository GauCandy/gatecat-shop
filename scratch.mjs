import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query("SELECT id, email, role FROM users");
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

main();
