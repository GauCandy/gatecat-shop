import nodemailer, { type Transporter } from "nodemailer";

type GlobalWithTransport = typeof globalThis & { __mailTransport?: Transporter };
const g = globalThis as GlobalWithTransport;

function buildTransport(): Transporter {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE ?? "false").toLowerCase() === "true";

  if (!host || !user || !pass) {
    throw new Error("SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export function getTransport(): Transporter {
  if (!g.__mailTransport) g.__mailTransport = buildTransport();
  return g.__mailTransport;
}

function fromAddress(): string {
  const raw = process.env.MAIL_FROM?.trim();
  const user = process.env.SMTP_USER ?? "";
  if (!raw) return user;
  // If MAIL_FROM already looks like an email or "Name <email>", use as-is.
  if (raw.includes("@")) return raw;
  return user ? `"${raw}" <${user}>` : raw;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const transport = getTransport();
  await transport.sendMail({
    from: fromAddress(),
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}
