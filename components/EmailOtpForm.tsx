"use client";

import { useEffect, useRef, useState } from "react";

type Step = "email" | "otp";

export function EmailOtpForm({ agreed = true }: { agreed?: boolean }) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        retryInSeconds?: number;
      };
      if (!res.ok) {
        if (data.retryInSeconds) setCooldown(data.retryInSeconds);
        setError(data.error || "Không gửi được mã.");
        return;
      }
      setStep("otp");
      setInfo("Đã gửi mã 6 chữ số tới email của bạn.");
      setCooldown(60);
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (loading || cooldown > 0) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        retryInSeconds?: number;
      };
      if (!res.ok) {
        if (data.retryInSeconds) setCooldown(data.retryInSeconds);
        setError(data.error || "Không gửi được mã.");
        return;
      }
      setInfo("Đã gửi lại mã mới.");
      setCooldown(60);
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        // Tài khoản bị cấm → redirect sang trang login để hiển thị thông báo đầy đủ
        if (res.status === 403 && data.error === "banned") {
          window.location.href = "/login?error=banned";
          return;
        }
        setError(data.error || "Xác thực thất bại.");
        return;
      }
      // Hard nav so the server reads the new session cookie.
      window.location.href = "/";
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {step === "email" ? (
        <form onSubmit={requestOtp} className="space-y-3">
          <label className="mc-mono block text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400">
            ▸ Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mc-mono w-full border-2 border-zinc-700 bg-zinc-950 px-3 py-3 text-[13px] text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500"
          />
          <div className={!agreed ? "group relative" : ""}>
            <button
              type="submit"
              disabled={loading || !email.trim() || !agreed}
              className="mc-mono relative flex w-full items-center justify-center gap-2 border-2 border-orange-500 bg-orange-500 px-4 py-3 text-[12px] font-black uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-orange-400 hover:shadow-[4px_4px_0_#09090b] hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? "⟳ Đang gửi…" : "⬢ Gửi mã đăng nhập"}
            </button>
            {!agreed && (
              <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded border border-orange-500/40 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-orange-300 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                Vui lòng đồng ý điều khoản bên dưới trước
                <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-orange-500/40" />
              </span>
            )}
          </div>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-3">
          <div className="mc-mono flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.24em]">
            <span className="text-zinc-400">▸ Mã gửi tới</span>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
                setInfo(null);
              }}
              className="text-orange-400 underline transition hover:text-orange-300"
            >
              đổi email
            </button>
          </div>
          <p className="mc-mono break-all text-[12px] font-bold uppercase tracking-[0.12em] text-zinc-200">
            {email}
          </p>
          <label className="mc-mono mt-2 block text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400">
            ▸ Mã 6 chữ số
          </label>
          <input
            ref={otpRef}
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="mc-mono w-full border-2 border-zinc-700 bg-zinc-950 px-3 py-3 text-center text-[20px] font-black tracking-[0.4em] text-orange-400 placeholder-zinc-700 outline-none transition focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="mc-mono group relative flex w-full items-center justify-center gap-2 border-2 border-orange-500 bg-orange-500 px-4 py-3 text-[12px] font-black uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-orange-400 hover:shadow-[4px_4px_0_#09090b] hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? "⟳ Đang xác thực…" : "⬢ Xác thực & đăng nhập"}
          </button>
          <button
            type="button"
            onClick={resendOtp}
            disabled={loading || cooldown > 0}
            className="mc-mono w-full text-center text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400 underline transition hover:text-orange-400 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
          >
            {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã"}
          </button>
        </form>
      )}

      {(error || info) && (
        <div
          className={`mt-4 border-2 px-3 py-2 ${
            error
              ? "border-red-500/60 bg-red-500/10"
              : "border-emerald-500/60 bg-emerald-500/10"
          }`}
        >
          <p
            className={`mc-mono text-[11px] uppercase tracking-[0.12em] ${
              error ? "text-red-300" : "text-emerald-300"
            }`}
          >
            {error || info}
          </p>
        </div>
      )}
    </div>
  );
}
