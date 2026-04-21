import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";
import { isAdminRequest } from "@/lib/admin";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!(await isAdminRequest(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const { isFeatured } = (await req.json().catch(() => ({}))) as {
    isFeatured?: boolean;
  };
  if (typeof isFeatured !== "boolean") {
    return NextResponse.json({ error: "isFeatured phải là boolean" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `UPDATE categories
     SET is_featured = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, slug, image_url AS "imageUrl", sort_order AS "sortOrder",
               parent_id AS "parentId", is_featured AS "isFeatured"`,
    [id, isFeatured]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
  }
  return NextResponse.json({ category: rows[0] });
}
