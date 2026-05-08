import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://whitecat:MeoMeo123!@node-1.whitecat.cloud:30010/gatecat_shop' });
async function main() {
  const res = await pool.query("SELECT id, name, slug, image_url FROM products WHERE slug LIKE '%razer-huntsman%'");
  console.log('Product:', res.rows);
  if (res.rows[0]) {
    const vRes = await pool.query("SELECT id, sku, image_url FROM product_variants WHERE product_id = $1", [res.rows[0].id]);
    console.log('Variants:', vRes.rows);
  }
  pool.end();
}
main();
