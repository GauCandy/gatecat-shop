"use client";

import { useState } from "react";
import Link from "next/link";
import { EmailOtpForm } from "./EmailOtpForm";

export function LoginFormClient() {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      {/* Google */}
      <div className={`relative mt-7 ${!agreed ? "group" : ""}`}>
        <a
          href="/api/auth/google/start"
          onClick={!agreed ? (e) => e.preventDefault() : undefined}
          aria-disabled={!agreed}
          className={`mc-mono flex w-full items-center justify-center gap-3 border-2 border-zinc-700 bg-zinc-950 px-4 py-3.5 text-[12px] font-black uppercase tracking-[0.2em] text-zinc-100 transition ${
            agreed
              ? "hover:border-orange-500 hover:bg-zinc-900 hover:text-orange-400 hover:shadow-[4px_4px_0_#09090b] hover:-translate-x-0.5 hover:-translate-y-0.5"
              : "cursor-not-allowed opacity-40"
          }`}
        >
          <GoogleIcon />
          <span>⬢ Đăng nhập với Google</span>
        </a>
        {!agreed && <AgreeHint />}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span aria-hidden className="h-px flex-1 bg-zinc-800" />
        <span className="mc-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
          hoặc
        </span>
        <span aria-hidden className="h-px flex-1 bg-zinc-800" />
      </div>

      <div className="mt-6">
        <EmailOtpForm agreed={agreed} />
      </div>

      {/* Checkbox — dưới cùng */}
      <label className="mt-6 flex cursor-pointer items-start gap-2.5 border-t-2 border-zinc-800 pt-5">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
        />
        <span className="mc-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-zinc-400">
          Tôi đồng ý với{" "}
          <Link
            href="/legal#terms"
            className="text-orange-400 underline transition hover:text-orange-300"
            onClick={(e) => e.stopPropagation()}
          >
            điều khoản
          </Link>{" "}
          và{" "}
          <Link
            href="/legal#privacy"
            className="text-orange-400 underline transition hover:text-orange-300"
            onClick={(e) => e.stopPropagation()}
          >
            chính sách bảo mật
          </Link>
        </span>
      </label>
    </>
  );
}

function AgreeHint() {
  return (
    <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded border border-orange-500/40 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-orange-300 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
      Vui lòng đồng ý điều khoản bên dưới trước
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-orange-500/40" />
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.3 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.3 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 13.9-5.4l-6.4-5.4c-2.1 1.4-4.7 2.3-7.5 2.3-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.4 5.4c3.7-3.4 6.5-8.5 6.5-15 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
