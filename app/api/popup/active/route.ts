import { NextResponse } from "next/server";
import { getActivePopup } from "@/lib/site";

export async function GET() {
  const popup = await getActivePopup();
  return NextResponse.json({ popup });
}
