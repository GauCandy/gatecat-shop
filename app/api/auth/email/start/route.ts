import { NextRequest, NextResponse } from "next/server";
import { issueOtp } from "@/lib/email-otp";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "Email không hợp lệ.",
  rate_limited: "Vui lòng đợi trước khi yêu cầu mã mới.",
  send_failed: "Không gửi được email, vui lòng thử lại sau.",
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
  }

  const email = typeof (body as { email?: unknown })?.email === "string"
    ? ((body as { email: string }).email)
    : "";

  if (!email) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
  }

  const result = await issueOtp(email);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: ERROR_MESSAGES[result.error] ?? "Không gửi được mã.",
        retryInSeconds: result.retryInSeconds,
      },
      { status: result.error === "rate_limited" ? 429 : 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
