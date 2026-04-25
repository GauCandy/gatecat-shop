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
          className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 text-[14px] text-[var(--color-text-dim)] cursor-not-allowed"
        />
      </Field>
      <Field label="Họ và tên" required>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition"
        />
      </Field>
      <Field label="Số điện thoại" hint="Định dạng VN, ví dụ 0912345678">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\s+/g, ""))}
          placeholder="0912345678"
          inputMode="tel"
          className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ngày sinh">
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition"
          />
        </Field>
        <Field label="Giới tính">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender | "")}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition"
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
          className={`rounded-lg px-3.5 py-2.5 text-[13px] font-medium ${
            feedback.kind === "ok"
              ? "bg-green-500/10 text-green-700"
              : "bg-red-500/10 text-red-700"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <div className="flex gap-3 pt-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center rounded-lg bg-[var(--color-accent)] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Đang lưu..." : "Lưu thay đổi"}
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
      <span className="mb-2 flex items-baseline gap-1.5 text-[13px] font-semibold text-[var(--color-text)]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-[12px] text-[var(--color-text-dim)]">
          {hint}
        </span>
      )}
    </label>
  );
}
