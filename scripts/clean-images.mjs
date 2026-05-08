import fs from 'fs';
import path from 'path';
import url from 'url';
import pg from 'pg';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_UPLOADS_DIR = path.join(ROOT_DIR, 'data', 'uploads');
const PUBLIC_UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

function fileExists(urlPath) {
  if (!urlPath) return true; // nothing to check
  // urlPath is like /api/uploads/filename.ext or /uploads/filename.ext
  if (urlPath.startsWith('/api/uploads/')) {
    const filename = urlPath.replace('/api/uploads/', '');
    const p1 = path.join(DATA_UPLOADS_DIR, filename);
    if (fs.existsSync(p1)) return true;
    const p2 = path.join(PUBLIC_UPLOADS_DIR, filename);
    if (fs.existsSync(p2)) return true;
    return false;
  }
  if (urlPath.startsWith('/uploads/')) {
    const filename = urlPath.replace('/uploads/', '');
    const p1 = path.join(PUBLIC_UPLOADS_DIR, filename);
    if (fs.existsSync(p1)) return true;
    return false;
  }
  // For other things like /hero/featured.jpg
  if (urlPath.startsWith('/')) {
    const p1 = path.join(PUBLIC_DIR, urlPath.slice(1));
    if (fs.existsSync(p1)) return true;
    return false;
  }
  return true; // external urls or unknown format, assume true
}

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://whitecat:MeoMeo123!@node-1.whitecat.cloud:30010/gatecat_shop' });
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Clean products
    const { rows: products } = await client.query('SELECT id, image_url FROM products WHERE image_url IS NOT NULL');
    let pCount = 0;
    for (const p of products) {
      if (!fileExists(p.image_url)) {
        console.log(`Product ${p.id}: missing image ${p.image_url}`);
        await client.query('UPDATE products SET image_url = NULL WHERE id = $1', [p.id]);
        pCount++;
      }
    }
    
    // Clean product_variants
    const { rows: variants } = await client.query('SELECT id, image_url FROM product_variants WHERE image_url IS NOT NULL');
    let vCount = 0;
    for (const v of variants) {
      if (!fileExists(v.image_url)) {
        console.log(`Variant ${v.id}: missing image ${v.image_url}`);
        await client.query('UPDATE product_variants SET image_url = NULL WHERE id = $1', [v.id]);
        vCount++;
      }
    }
    
    await client.query('COMMIT');
    console.log(`Cleaned ${pCount} products and ${vCount} variants.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
