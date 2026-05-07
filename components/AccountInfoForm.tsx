"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile, Gender } from "@/lib/users";

const GENDER_OPTIONS: { value: Gender | ""; label: string }[] = [
  { value: "", label: "Không tiết lộ" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const FIELD_INPUT =
  "mc-mono h-11 w-full border-2 border-zinc-700 bg-zinc-950 px-3.5 text-[13px] font-bold uppercase tracking-[0.04em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition";

export function AccountInfoForm({ initial }: { initial: UserProfile }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [dob, setDob] = useState(initial.dateOfBirth ?? "");
  const [gender, setGender] = useState<Gender | "">(initial.gender ?? "");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "err"; msg: string } | null
  >(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || null,
          dateOfBirth: dob || null,
          gender: gender || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ kind: "err", msg: data?.error ?? "Không lưu được" });
        return;
      }
      setFeedback({ kind: "ok", msg: "✓ Đã lưu thay đổi" });
      router.refresh();
    } catch {
      setFeedback({ kind: "err", msg: "Lỗi kết nối" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Email">
        <input
          value={initial.email}
          disabled
          className="mc-mono h-11 w-full cursor-not-allowed border-2 border-zinc-800 bg-zinc-900 px-3.5 text-[13px] font-bold uppercase tracking-[0.04em] text-zinc-500"
        />
      </Field>
      <Field label="Họ và tên" required>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          className={FIELD_INPUT}
        />
      </Field>
      <Field label="Số điện thoại" hint="Định dạng VN, ví dụ 0912345678">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\s+/g, ""))}
          placeholder="0912345678"
          inputMode="tel"
          className={FIELD_INPUT}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ngày sinh">
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className={FIELD_INPUT}
          />
        </Field>
        <Field label="Giới tính">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender | "")}
            className={FIELD_INPUT}
          >
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {feedback && (
        <div
          role="status"
          className={`mc-mono border-2 px-3.5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] ${
            feedback.kind === "ok"
              ? "border-green-500/60 bg-green-500/10 text-green-300"
              : "border-red-500/60 bg-red-500/10 text-red-300"
          }`}
        >
          ⬢ {feedback.msg}
        </div>
      )}

      <div className="flex gap-3 border-t-2 border-zinc-800 pt-5">
        <button
          type="submit"
          disabled={busy}
          className="mc-btn-primary mc-btn-primary-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          ⬢ {busy ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mc-mono mb-2 flex items-baseline gap-1.5 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
        ⬢ {label}
        {required && <span className="text-yellow-400">*</span>}
      </span>
      {children}
      {hint && (
        <span className="mc-mono mt-1.5 block text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ {hint}
        </span>
      )}
    </label>
  );
}
