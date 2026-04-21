import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const outputDir = path.join(process.cwd(), "public", "uploads", "categories");
const baseUrl = "https://unpkg.com/@tabler/icons@3.41.1/icons/outline";

const iconCandidates = {
  laptop: ["device-laptop"],
  "laptop-gaming": ["device-laptop", "device-gamepad-2"],
  "laptop-van-phong": ["briefcase", "device-laptop"],
  "laptop-do-hoa": ["palette", "device-laptop"],
  "laptop-mong-nhe": ["feather", "device-laptop"],
  macbook: ["brand-apple", "device-laptop"],

  pc: ["device-desktop"],
  "pc-gaming": ["device-desktop", "device-gamepad-2"],
  "pc-van-phong": ["device-desktop"],
  "pc-do-hoa": ["device-desktop-code", "device-desktop"],
  "mini-pc": ["box", "device-desktop"],
  "pc-all-in-one": ["device-imac", "device-desktop"],

  "man-hinh": ["device-desktop"],
  "man-hinh-22-inch": ["device-desktop"],
  "man-hinh-24-inch": ["device-desktop"],
  "man-hinh-27-inch": ["device-desktop"],
  "man-hinh-32-inch": ["device-desktop"],
  "man-hinh-cong": ["device-desktop", "chart-arc"],
  "man-hinh-4k": ["badge-4k", "device-desktop"],
  "man-hinh-gaming": ["device-desktop", "device-gamepad-2"],
  "man-hinh-do-hoa": ["palette", "device-desktop"],

  "linh-kien-may-tinh": ["cpu"],
  cpu: ["cpu"],
  "card-do-hoa": ["gpu-card", "device-desktop"],
  mainboard: ["circuit-board", "cpu"],
  ram: ["device-sd-card", "cpu"],
  "o-cung": ["database"],
  ssd: ["device-sd-card", "database"],
  hdd: ["database"],
  "nguon-may-tinh": ["plug"],
  "case-may-tinh": ["box"],
  "vo-case": ["box"],
  "quat-case": ["fan"],
  "tan-nhiet": ["droplet", "snowflake"],
  "tan-nhiet-cpu": ["snowflake", "cpu"],

  "phu-kien": ["devices"],
  "ban-phim": ["keyboard"],
  "ban-phim-co": ["keyboard"],
  "ban-phim-khong-day": ["keyboard"],
  "ban-phim-van-phong": ["keyboard"],
  "ban-phim-gaming": ["keyboard"],
  chuot: ["mouse"],
  "chuot-gaming": ["mouse"],
  "chuot-van-phong": ["mouse"],
  "chuot-khong-day": ["mouse"],
  "chuot-bluetooth": ["mouse"],
  "tai-nghe": ["headphones"],
  "tai-nghe-gaming": ["headset", "headphones"],
  "tai-nghe-bluetooth": ["headphones"],
  "tai-nghe-tws": ["earbuds", "headphones"],
  "tai-nghe-co-day": ["headphones"],
  "loa-may-tinh": ["speakerphone", "speaker"],
  "loa-bluetooth": ["speakerphone", "speaker"],
  "loa-soundbar": ["speakerphone", "speaker"],
  "loa-2-1": ["speakerphone", "speaker"],
  "hub-usb": ["usb", "devices"],
  "cap-sac": ["cable", "plug-connected", "plug"],
  "balo-laptop": ["backpack"],
  "de-tan-nhiet-laptop": ["fan", "device-laptop"],
  "o-cung-di-dong": ["database", "device-sd-card"],
  mousepad: ["rectangle", "square"],
  microphone: ["microphone"],
  webcam: ["camera"],
  "tay-cam-gaming": ["device-gamepad-2"],

  "noi-that-gaming": ["armchair"],
  "ghe-gaming": ["armchair"],
  "ban-gaming": ["table", "device-desktop"],
  "gia-do-man-hinh": ["armchair", "device-desktop"],
};

function normalizeSvg(svg) {
  return svg
    .replace(/stroke="currentColor"/g, 'stroke="#111827"')
    .replace(/width="24"/, 'width="64"')
    .replace(/height="24"/, 'height="64"');
}

async function fetchIcon(name) {
  const res = await fetch(`${baseUrl}/${name}.svg`, {
    headers: { "user-agent": "Gatecat category icon downloader" },
  });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") ?? "";
  const text = await res.text();
  if (!type.includes("svg") || !text.includes("<svg")) return null;
  return normalizeSvg(text);
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const client = await pool.connect();
  try {
    const { rows: categories } = await client.query(
      "SELECT id, name, slug FROM categories ORDER BY sort_order ASC, name ASC"
    );

    let updated = 0;
    const missing = [];
    for (const category of categories) {
      const candidates = [
        ...(iconCandidates[category.slug] ?? []),
        "category",
        "folder",
      ];

      let chosen = null;
      let svg = null;
      for (const icon of candidates) {
        svg = await fetchIcon(icon);
        if (svg) {
          chosen = icon;
          break;
        }
      }

      if (!svg || !chosen) {
        missing.push(category.slug);
        continue;
      }

      const fileName = `${category.slug}.svg`;
      await writeFile(path.join(outputDir, fileName), svg, "utf8");
      await client.query(
        "UPDATE categories SET image_url = $1, updated_at = NOW() WHERE id = $2",
        [`/uploads/categories/${fileName}`, category.id]
      );
      updated++;
      console.log(`${updated}/${categories.length} ${category.slug} <- ${chosen}`);
    }

    console.log(
      JSON.stringify(
        {
          categories: categories.length,
          updated,
          missing,
          source: "Tabler Icons 3.41.1, MIT license",
        },
        null,
        2
      )
    );
    if (missing.length) process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
