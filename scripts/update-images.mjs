import crypto from "node:crypto";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const BASE_URL = "http://localhost:8443";
const ADMIN_EMAIL = "gaulollipop@gmail.com";

async function createAdminSession(pool) {
  const { rows } = await pool.query("SELECT id FROM users WHERE email = $1 AND role = 'ADMIN'", [ADMIN_EMAIL]);
  if (!rows.length) throw new Error("Admin not found");
  const userId = rows[0].id;
  
  const token = crypto.randomBytes(32).toString("base64url");
  const id = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 86400 * 1000);
  
  await pool.query(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
    [id, userId, expiresAt]
  );
  return token;
}

async function uploadImageForProduct(token, product) {
  console.log(`Downloading image for ${product.name}...`);
  // Generate a placeholder with the product name
  const text = encodeURIComponent(product.name.split(" ").slice(0, 3).join(" "));
  const imageUrl = `https://placehold.co/800x600/1e1e2f/00ffcc/png?text=${text}`;
  
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Failed to download image");
  const imgBlob = await imgRes.blob();
  
  // Format variants for the form
  const variants = product.variants.map((v, i) => ({
    id: v.id,
    sku: v.sku,
    listPrice: v.listPrice,
    salePrice: v.salePrice,
    stock: v.stock,
    imageOp: "keep"
  }));
  
  const formData = new FormData();
  formData.append("name", product.name);
  formData.append("description", product.description || "");
  product.categoryIds?.forEach(c => formData.append("categoryIds", c));
  
  formData.append("variants", JSON.stringify(variants));
  formData.append("image", imgBlob, "product.png");

  console.log(`Uploading for ${product.name}...`);
  const res = await fetch(`${BASE_URL}/api/admin/products/${product.id}`, {
    method: "PATCH",
    headers: {
      Cookie: `session=${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${res.status} ${err}`);
  }
  
  console.log(`✓ Updated ${product.name}`);
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let token;
  try {
    token = await createAdminSession(pool);
    console.log("Created admin session");
  } catch(e) {
    console.error("Session error:", e);
    await pool.end();
    return;
  }
  
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products`, {
      headers: { Cookie: `session=${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch products: " + await res.text());
    
    const { products } = await res.json();
    console.log(`Found ${products.length} products.`);
    
    for (const p of products) {
      if (p.imageUrl) {
         console.log(`Skipping ${p.name}, already has image.`);
         continue;
      }
      try {
        await uploadImageForProduct(token, p);
      } catch (err) {
        console.error(`Error for ${p.name}:`, err.message);
      }
      // Wait a bit to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (e) {
    console.error(e);
  } finally {
    // Cleanup session
    const id = crypto.createHash("sha256").update(token).digest("hex");
    await pool.query("DELETE FROM sessions WHERE id = $1", [id]);
    await pool.end();
  }
}

main();
