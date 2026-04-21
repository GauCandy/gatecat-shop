import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const outputDir = path.join(process.cwd(), "public", "uploads", "products");

const headers = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0 Safari/537.36",
  referer: "https://duckduckgo.com/",
};

function safeFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extFromContentType(contentType) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "jpg";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function duckImageResults(query) {
  const encoded = encodeURIComponent(query);
  const htmlRes = await fetch(
    `https://duckduckgo.com/?q=${encoded}&iax=images&ia=images`,
    { headers }
  );
  if (!htmlRes.ok) throw new Error(`DDG page status ${htmlRes.status}`);
  const html = await htmlRes.text();
  const vqd = html.match(/vqd="([^"]+)"/)?.[1];
  if (!vqd) throw new Error("Cannot find DDG vqd token");

  const apiRes = await fetch(
    `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encoded}&vqd=${encodeURIComponent(
      vqd
    )}&f=,,,&p=1`,
    { headers }
  );
  if (!apiRes.ok) throw new Error(`DDG image API status ${apiRes.status}`);
  const text = await apiRes.text();
  const data = JSON.parse(text);
  return Array.isArray(data.results) ? data.results : [];
}

async function downloadFirstUsable(urls) {
  let lastError = null;
  for (const url of urls.slice(0, 12)) {
    try {
      const res = await fetch(url, { headers, redirect: "follow" });
      if (!res.ok) throw new Error(`image status ${res.status}`);
      const type = res.headers.get("content-type") ?? "";
      if (!type.startsWith("image/")) throw new Error(`not image: ${type}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 8000) throw new Error("image too small");
      return { buffer, ext: extFromContentType(type), sourceUrl: url };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("no usable image");
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT p.id AS product_id, p.name, v.id AS variant_id, v.sku
       FROM products p
       JOIN product_variants v ON v.product_id = p.id
       WHERE v.sku NOT LIKE 'LEGACY-%'
       ORDER BY p.sort_order ASC, p.name ASC`
    );

    let downloaded = 0;
    const failures = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const query = `${row.name} product image`;
      try {
        const results = await duckImageResults(query);
        const imageUrls = results
          .filter((r) => Number(r.width ?? 0) >= 400 && Number(r.height ?? 0) >= 300)
          .map((r) => r.image)
          .filter(Boolean);
        if (!imageUrls.length) throw new Error("no image results");

        const image = await downloadFirstUsable(imageUrls);
        const fileName = `${safeFileName(row.sku)}.${image.ext}`;
        const filePath = path.join(outputDir, fileName);
        const publicUrl = `/uploads/products/${fileName}`;
        await writeFile(filePath, image.buffer);
        await client.query(
          `UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2`,
          [publicUrl, row.product_id]
        );
        await client.query(
          `UPDATE product_variants SET image_url = $1, updated_at = NOW() WHERE id = $2`,
          [publicUrl, row.variant_id]
        );
        downloaded++;
        console.log(`${downloaded}/${rows.length} ${row.sku} <- ${image.sourceUrl}`);
      } catch (error) {
        failures.push({ sku: row.sku, name: row.name, message: error.message });
        console.error(`FAILED ${row.sku}: ${error.message}`);
      }
      await sleep(250);
    }

    console.log(
      JSON.stringify(
        {
          attempted: rows.length,
          downloaded,
          failed: failures.length,
          failures,
        },
        null,
        2
      )
    );

    if (failures.length) process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
