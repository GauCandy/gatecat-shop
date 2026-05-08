import { sendMail } from "./mailer";
import { getSiteSettings } from "./site";

type LoginMethod = "google" | "email";

const METHOD_LABEL: Record<LoginMethod, string> = {
  google: "Google",
  email: "Email + OTP",
};

function formatLocal(d: Date): string {
  // Vietnam local time
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

export async function sendLoginNotification(opts: {
  email: string;
  name?: string | null;
  method: LoginMethod;
  ip?: string | null;
  userAgent?: string | null;
}) {
  try {
    const now = new Date();
    const when = formatLocal(now);
    const settings = await getSiteSettings().catch(() => ({ siteName: "GateCat" }));
    const siteName = settings.siteName || "GateCat";

    const greet = opts.name ? `Chào ${opts.name},` : "Xin chào,";
    const ip = opts.ip || "không xác định";
    const ua = opts.userAgent || "không xác định";

    const text = [
      greet,
      ``,
      `Tài khoản của bạn vừa được đăng nhập vào ${siteName}.`,
      ``,
      `• Thời gian: ${when} (giờ Việt Nam)`,
      `• Phương thức: ${METHOD_LABEL[opts.method]}`,
      `• Địa chỉ IP: ${ip}`,
      `• Thiết bị: ${ua}`,
      ``,
      `Nếu không phải bạn, vui lòng đổi mật khẩu các dịch vụ liên kết và liên hệ hỗ trợ ngay.`,
    ].join("\n");

    await sendMail({
      to: opts.email,
      subject: `[${siteName}] Đăng nhập mới vào tài khoản của bạn`,
      text,
      html: loginNotifyHtml({
        siteName,
        greet,
        when,
        method: METHOD_LABEL[opts.method],
        ip,
        ua,
      }),
    });
  } catch (e) {
    // Login should not fail just because notification email failed.
    console.error("login notification send failed", e);
  }
}

function loginNotifyHtml(p: {
  siteName: string;
  greet: string;
  when: string;
  method: string;
  ip: string;
  ua: string;
}): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#09090b;font-family:Segoe UI,Roboto,sans-serif;color:#e4e4e7">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="border:2px solid #3f3f46;background:#18181b;padding:28px">
      <p style="margin:0 0 8px;color:#f97316;font-size:11px;font-weight:800;letter-spacing:0.32em;text-transform:uppercase">⬢ ${escapeHtml(p.siteName)} · SECURITY</p>
      <h1 style="margin:0 0 12px;font-size:22px;color:#fafafa;text-transform:uppercase;letter-spacing:-0.02em">Đăng nhập mới</h1>
      <p style="margin:0 0 18px;font-size:13px;color:#a1a1aa">${escapeHtml(p.greet)} có một phiên đăng nhập vừa được tạo cho tài khoản của bạn.</p>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td style="padding:8px 0;color:#71717a;width:130px">Thời gian</td><td style="padding:8px 0;color:#fafafa">${escapeHtml(p.when)} <span style="color:#71717a">(GMT+7)</span></td></tr>
        <tr><td style="padding:8px 0;color:#71717a">Phương thức</td><td style="padding:8px 0;color:#fafafa">${escapeHtml(p.method)}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a">Địa chỉ IP</td><td style="padding:8px 0;color:#fafafa">${escapeHtml(p.ip)}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;vertical-align:top">Thiết bị</td><td style="padding:8px 0;color:#fafafa;word-break:break-all">${escapeHtml(p.ua)}</td></tr>
      </table>
      <div style="margin-top:20px;border-top:1px solid #27272a;padding-top:16px;font-size:12px;color:#a1a1aa">
        Nếu không phải bạn, hãy thoát khỏi tất cả các phiên và đổi mật khẩu tài khoản liên kết ngay.
      </div>
    </div>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
