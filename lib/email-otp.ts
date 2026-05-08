import crypto from "node:crypto";
import { pool } from "./db";
import { sendMail } from "./mailer";

const OTP_TTL_MIN = 10;
const OTP_RESEND_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 254;
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

export type OtpIssueResult =
  | { ok: true }
  | { ok: false; error: "invalid_email" | "rate_limited" | "send_failed"; retryInSeconds?: number };

export async function issueOtp(rawEmail: string): Promise<OtpIssueResult> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) return { ok: false, error: "invalid_email" };

  const { rows: recent } = await pool.query<{ created_at: Date }>(
    `SELECT created_at FROM email_otps
     WHERE email = $1 AND consumed_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [email]
  );
  if (recent[0]) {
    const elapsed = (Date.now() - recent[0].created_at.getTime()) / 1000;
    if (elapsed < OTP_RESEND_SECONDS) {
      return {
        ok: false,
        error: "rate_limited",
        retryInSeconds: Math.ceil(OTP_RESEND_SECONDS - elapsed),
      };
    }
  }

  const code = generateCode();
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

  await pool.query(
    `INSERT INTO email_otps (id, email, code_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [id, email, hashCode(code), expiresAt]
  );

  try {
    await sendMail({
      to: email,
      subject: `Mã đăng nhập GateCat: ${code}`,
      text: `Mã đăng nhập của bạn: ${code}\nMã có hiệu lực trong ${OTP_TTL_MIN} phút.\nNếu không phải bạn, vui lòng bỏ qua email này.`,
      html: otpEmailHtml(code),
    });
  } catch (e) {
    console.error("send otp email failed", e);
    return { ok: false, error: "send_failed" };
  }

  return { ok: true };
}

export type OtpVerifyResult =
  | { ok: true; email: string }
  | { ok: false; error: "invalid_email" | "no_otp" | "expired" | "wrong_code" | "too_many_attempts" };

export async function verifyOtp(rawEmail: string, rawCode: string): Promise<OtpVerifyResult> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) return { ok: false, error: "invalid_email" };

  const code = rawCode.trim();
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "wrong_code" };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<{
      id: string;
      code_hash: string;
      expires_at: Date;
      attempts: number;
    }>(
      `SELECT id, code_hash, expires_at, attempts
       FROM email_otps
       WHERE email = $1 AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1
       FOR UPDATE`,
      [email]
    );

    const row = rows[0];
    if (!row) {
      await client.query("COMMIT");
      return { ok: false, error: "no_otp" };
    }

    if (row.expires_at.getTime() <= Date.now()) {
      await client.query("COMMIT");
      return { ok: false, error: "expired" };
    }

    if (row.attempts >= OTP_MAX_ATTEMPTS) {
      await client.query(
        `UPDATE email_otps SET consumed_at = NOW() WHERE id = $1`,
        [row.id]
      );
      await client.query("COMMIT");
      return { ok: false, error: "too_many_attempts" };
    }

    if (row.code_hash !== hashCode(code)) {
      await client.query(
        `UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1`,
        [row.id]
      );
      await client.query("COMMIT");
      return { ok: false, error: "wrong_code" };
    }

    await client.query(
      `UPDATE email_otps SET consumed_at = NOW() WHERE id = $1`,
      [row.id]
    );
    await client.query("COMMIT");
    return { ok: true, email };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

function otpEmailHtml(code: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#09090b;font-family:Segoe UI,Roboto,sans-serif;color:#e4e4e7">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px">
    <div style="border:2px solid #3f3f46;background:#18181b;padding:28px">
      <p style="margin:0 0 8px;color:#f97316;font-size:11px;font-weight:800;letter-spacing:0.32em;text-transform:uppercase">⬢ AUTH TERMINAL</p>
      <h1 style="margin:0 0 16px;font-size:22px;color:#fafafa;text-transform:uppercase;letter-spacing:-0.02em">Mã đăng nhập</h1>
      <p style="margin:0 0 20px;font-size:13px;color:#a1a1aa">Nhập mã sau để hoàn tất đăng nhập vào GateCat:</p>
      <div style="text-align:center;border:2px solid #f97316;padding:20px;margin:20px 0;background:#0a0a0a">
        <span style="font-family:Consolas,monospace;font-size:34px;font-weight:900;letter-spacing:0.4em;color:#f97316">${code}</span>
      </div>
      <p style="margin:16px 0 0;font-size:12px;color:#71717a">Mã có hiệu lực trong ${OTP_TTL_MIN} phút. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
    </div>
  </div>
</body></html>`;
}
