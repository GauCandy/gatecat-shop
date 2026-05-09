"use client";

import { useEffect, useRef, useState } from "react";
import type { Banner, Popup, SiteSettings } from "@/lib/site";
import { toast } from "@/components/Toaster";

const TABS = [
  { id: "general", label: "Logo & tên" },
  { id: "marquee", label: "Marquee" },
  { id: "hero", label: "Hero" },
  { id: "banners", label: "Banner trang chủ" },
  { id: "popups", label: "Popup quảng cáo" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function SiteManager({
  initialSettings,
  initialBanners,
  initialPopups,
}: {
  initialSettings: SiteSettings;
  initialBanners: Banner[];
  initialPopups: Popup[];
}) {
  const [tab, setTab] = useState<Tab>("general");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-2 text-[13px] font-medium transition ${
              tab === t.id
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
            )}
          </button>
        ))}
      </div>

      {tab === "general" && <GeneralTab initial={initialSettings} />}
      {tab === "marquee" && <MarqueeTab initial={initialSettings} />}
      {tab === "hero" && <HeroTab initial={initialSettings} />}
      {tab === "banners" && <BannerTab initial={initialBanners} />}
      {tab === "popups" && <PopupTab initial={initialPopups} />}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-7 w-7"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function GeneralTab({ initial }: { initial: SiteSettings }) {
  const [siteName, setSiteName] = useState(initial.siteName);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("siteName", siteName);
    const file = fileRef.current?.files?.[0];
    if (file) fd.set("logo", file);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/site/settings", { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error ?? "Lưu thất bại", "error");
        return;
      }
      setSiteName(data.settings.siteName);
      setLogoUrl(data.settings.logoUrl);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      toast("Đã lưu cài đặt", "success");
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm("Xoá logo hiện tại?")) return;
    const fd = new FormData();
    fd.set("removeLogo", "1");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/site/settings", { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error ?? "Xoá thất bại", "error");
        return;
      }
      setLogoUrl(data.settings.logoUrl);
      toast("Đã xoá logo", "success");
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-[var(--color-border-strong)] bg-zinc-900 p-5 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-[12px] font-medium text-[var(--color-text-dim)]">
          Tên website
        </label>
        <input
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
        <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
          Hiện ở header bên cạnh logo, ngoài tab trình duyệt.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-[var(--color-text-dim)]">
          Logo (PNG / SVG / WebP, tối đa 5MB)
        </label>
        <div className="flex items-start gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] overflow-hidden">
            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={preview} alt="preview" className="h-full w-full object-contain" />
            ) : logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoUrl} alt="logo" className="h-full w-full object-contain" />
            ) : (
              <span className="text-[10px] text-[var(--color-text-dim)]">Chưa có</span>
            )}
          </div>
          <div className="flex-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-[var(--color-border-strong)] bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {preview ? "Đổi file khác" : logoUrl ? "Đổi logo" : "Chọn ảnh logo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
              className="hidden"
            />
            {logoUrl && !preview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={busy}
                className="ml-2 text-[12px] text-red-400 hover:underline disabled:opacity-50"
              >
                Xoá logo
              </button>
            )}
            {preview && (
              <span className="ml-2 text-[12px] text-[var(--color-text-dim)]">
                Đã chọn ảnh mới
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}

/* ─────────────── Marquee Tab ─────────────── */

function MarqueeTab({ initial }: { initial: SiteSettings }) {
  const [items, setItems] = useState<string[]>(initial.marqueeItems);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = items.filter((v) => v.trim());
    if (cleaned.length === 0) {
      toast("Cần ít nhất 1 nội dung marquee", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/site/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marqueeItems: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error ?? "Lưu thất bại", "error");
        return;
      }
      setItems(data.settings.marqueeItems);
      toast("Đã lưu marquee", "success");
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-[var(--color-border-strong)] bg-zinc-900 p-5"
    >
      <p className="text-[12px] text-[var(--color-text-dim)]">
        Các dòng chữ chạy ở trên cùng trang chủ.
      </p>

      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-7 shrink-0 text-center text-[11px] font-medium text-[var(--color-text-dim)]">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                setItems((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)));
              }}
              placeholder="Nội dung..."
              className="h-9 flex-1 rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--color-border)] bg-zinc-900 text-[12px] text-red-400 transition hover:border-red-500/60 hover:bg-red-500/10"
              aria-label="Xóa"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, ""])}
        className="self-start rounded-lg border border-dashed border-[var(--color-border-strong)] bg-zinc-900 px-4 py-1.5 text-[12px] font-medium text-[var(--color-text-dim)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        + Thêm dòng
      </button>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Đang lưu..." : "Lưu marquee"}
        </button>
      </div>
    </form>
  );
}

/* ─────────────── Hero Tab ─────────────── */

function HeroTab({ initial }: { initial: SiteSettings }) {
  /* Background */
  const [heroBgUrl, setHeroBgUrl] = useState(initial.heroBgUrl);
  const [heroBgPreview, setHeroBgPreview] = useState<string | null>(null);
  const [heroBgFile, setHeroBgFile] = useState<File | null>(null);
  const heroBgRef = useRef<HTMLInputElement>(null);

  /* Showcase */
  const [showcaseLabel, setShowcaseLabel] = useState(initial.heroShowcaseLabel);
  const [showcaseText, setShowcaseText] = useState(initial.heroShowcaseText);
  const [showcaseImageUrl, setShowcaseImageUrl] = useState(initial.heroShowcaseImageUrl);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [showcaseFile, setShowcaseFile] = useState<File | null>(null);
  const showcaseRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (heroBgPreview) URL.revokeObjectURL(heroBgPreview);
      if (showcasePreview) URL.revokeObjectURL(showcasePreview);
    };
  }, [heroBgPreview, showcasePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("_action", "hero");

      if (heroBgFile) fd.set("heroBg", heroBgFile);
      if (!heroBgFile && !heroBgUrl && initial.heroBgUrl) fd.set("removeHeroBg", "1");

      fd.set("heroShowcaseLabel", showcaseLabel);
      fd.set("heroShowcaseText", showcaseText);
      if (showcaseFile) fd.set("heroShowcaseImage", showcaseFile);
      if (!showcaseFile && !showcaseImageUrl && initial.heroShowcaseImageUrl) fd.set("removeShowcaseImage", "1");

      const res = await fetch("/api/admin/site/settings", { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error ?? "Lưu thất bại", "error");
        return;
      }

      setHeroBgUrl(data.settings.heroBgUrl);
      setHeroBgFile(null);
      if (heroBgPreview) URL.revokeObjectURL(heroBgPreview);
      setHeroBgPreview(null);
      if (heroBgRef.current) heroBgRef.current.value = "";

      setShowcaseLabel(data.settings.heroShowcaseLabel);
      setShowcaseText(data.settings.heroShowcaseText);
      setShowcaseImageUrl(data.settings.heroShowcaseImageUrl);
      setShowcaseFile(null);
      if (showcasePreview) URL.revokeObjectURL(showcasePreview);
      setShowcasePreview(null);
      if (showcaseRef.current) showcaseRef.current.value = "";

      toast("Đã lưu Hero", "success");
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  const bgDisplay = heroBgPreview || heroBgUrl;
  const showcaseDisplay = showcasePreview || showcaseImageUrl;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-xl border border-[var(--color-border-strong)] bg-zinc-900 p-5"
    >
      {/* ─── Background ─── */}
      <div className="border-b border-[var(--color-border)] pb-5">
        <h3 className="text-[13px] font-semibold text-[var(--color-text)]">Ảnh nền Hero</h3>
        <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">
          Ảnh nền phần đầu trang chủ. Hiển thị cover + overlay tối.
        </p>

        <div className="mt-3">
          {bgDisplay ? (
            <div className="relative aspect-[3/1] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bgDisplay} alt="Background preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-2 left-3 text-[10px] font-semibold uppercase tracking-widest text-white/70">BACKGROUND</span>
            </div>
          ) : (
            <div className="flex aspect-[3/1] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)]">
              <span className="text-[12px]">Chưa có ảnh nền</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => heroBgRef.current?.click()}
            className="rounded-lg border border-[var(--color-border-strong)] bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {bgDisplay ? "Đổi ảnh nền" : "Tải ảnh nền"}
          </button>
          {bgDisplay && (
            <button
              type="button"
              onClick={() => {
                setHeroBgFile(null);
                setHeroBgUrl(null);
                if (heroBgPreview) URL.revokeObjectURL(heroBgPreview);
                setHeroBgPreview(null);
                if (heroBgRef.current) heroBgRef.current.value = "";
              }}
              className="text-[12px] text-red-400 hover:underline"
            >
              Xóa ảnh nền
            </button>
          )}
          <input
            ref={heroBgRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setHeroBgFile(f);
              if (heroBgPreview) URL.revokeObjectURL(heroBgPreview);
              setHeroBgPreview(URL.createObjectURL(f));
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* ─── Showcase card ─── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[var(--color-text)]">Showcase Card (ô bên phải)</h3>
        <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">
          Ô hiển thị khi chưa có banner carousel. Có thể chèn ảnh + text.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[var(--color-text-dim)]">Label (nhỏ, phía trên)</label>
              <input
                type="text"
                value={showcaseLabel}
                onChange={(e) => setShowcaseLabel(e.target.value)}
                placeholder="NOW SHOWING"
                className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[var(--color-text-dim)]">Text chính (lớn)</label>
              <input
                type="text"
                value={showcaseText}
                onChange={(e) => setShowcaseText(e.target.value)}
                placeholder="Bộ sưu tập đang được lắp ráp."
                className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[var(--color-text-dim)]">Ảnh showcase</label>
            {showcaseDisplay ? (
              <div className="relative aspect-[5/4] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={showcaseDisplay} alt="Showcase preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-2 left-3 text-[10px] font-semibold uppercase tracking-widest text-white/70">SHOWCASE</span>
              </div>
            ) : (
              <div className="flex aspect-[5/4] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)]">
                <span className="text-[12px]">Chưa có</span>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => showcaseRef.current?.click()}
                className="rounded-lg border border-[var(--color-border-strong)] bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {showcaseDisplay ? "Đổi ảnh" : "Tải ảnh"}
              </button>
              {showcaseDisplay && (
                <button
                  type="button"
                  onClick={() => {
                    setShowcaseFile(null);
                    setShowcaseImageUrl(null);
                    if (showcasePreview) URL.revokeObjectURL(showcasePreview);
                    setShowcasePreview(null);
                    if (showcaseRef.current) showcaseRef.current.value = "";
                  }}
                  className="text-[12px] text-red-400 hover:underline"
                >
                  Xóa ảnh
                </button>
              )}
              <input
                ref={showcaseRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setShowcaseFile(f);
                  if (showcasePreview) URL.revokeObjectURL(showcasePreview);
                  setShowcasePreview(URL.createObjectURL(f));
                }}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[var(--color-text-dim)]">
        Tối đa 15MB (nền) / 10MB (showcase). PNG · JPG · WebP · GIF · AVIF.
      </p>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Đang lưu..." : "Lưu Hero"}
        </button>
      </div>
    </form>
  );
}

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function filterImageFiles(files: FileList | File[]): File[] {
  return Array.from(files).filter((f) => ACCEPTED_TYPES.has(f.type));
}

function BannerTab({ initial }: { initial: Banner[] }) {
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);

  const handleAddedMany = (created: Banner[]) => {
    setItems((prev) => [...prev, ...created]);
    setAdding(false);
  };
  const handleUpdated = (b: Banner) => {
    setItems((prev) => prev.map((x) => (x.id === b.id ? b : x)));
  };
  const handleDeleted = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[var(--color-text-dim)]">{items.length} banner</span>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-[13px] font-semibold text-white transition hover:brightness-110"
          >
            + Thêm banner
          </button>
        )}
      </div>

      {adding && (
        <BannerCreateForm
          onSaved={handleAddedMany}
          onCancel={() => setAdding(false)}
        />
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-8 text-center text-[13px] text-[var(--color-text-dim)]">
          Chưa có banner nào.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <BannerRow key={b.id} banner={b} onUpdate={handleUpdated} onDelete={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}

type DropItem = { file: File; preview: string };

function MultiDropZone({
  items,
  setItems,
  hint,
  busy,
}: {
  items: DropItem[];
  setItems: (updater: (prev: DropItem[]) => DropItem[]) => void;
  hint: string;
  busy: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    const next = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setItems((prev) => [...prev, ...next]);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const accepted = filterImageFiles(list);
    const rejected = list.length - accepted.length;
    addFiles(accepted);
    if (rejected > 0) {
      toast(`Đã bỏ ${rejected} file không phải ảnh`, "error");
    }
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (busy) return;
    const accepted = filterImageFiles(e.dataTransfer.files);
    const rejected = e.dataTransfer.files.length - accepted.length;
    addFiles(accepted);
    if (rejected > 0) {
      toast(`Đã bỏ ${rejected} file không phải ảnh`, "error");
    }
  };

  const removeAt = (i: number) => {
    setItems((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            !busy && inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver
            ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
            : "border-[var(--color-border-strong)] bg-[var(--color-surface-2)] hover:border-[var(--color-accent)] hover:bg-zinc-900"
        } ${busy ? "pointer-events-none opacity-60" : ""}`}
      >
        <span className="text-[var(--color-text-dim)]">
          <UploadIcon />
        </span>
        <span className="text-[14px] font-semibold text-[var(--color-text)]">
          Kéo thả ảnh vào đây hoặc click để chọn
        </span>
        <span className="text-[12px] text-[var(--color-text-dim)]">{hint}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          className="hidden"
        />
      </div>

      {items.length > 0 && (
        <div>
          <div className="mb-2 text-[12px] text-[var(--color-text-dim)]">
            Đã chọn {items.length} ảnh
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {items.map((it, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Bỏ ảnh"
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/65 text-white text-[12px] opacity-0 transition group-hover:opacity-100 hover:bg-black/85"
                >
                  ✕
                </button>
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
                  {it.file.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function useRevokePreviewsOnUnmount(items: DropItem[]) {
  const ref = useRef(items);
  ref.current = items;
  useEffect(() => {
    return () => {
      ref.current.forEach((it) => URL.revokeObjectURL(it.preview));
    };
  }, []);
}

function BannerCreateForm({
  onSaved,
  onCancel,
}: {
  onSaved: (created: Banner[]) => void;
  onCancel: () => void;
}) {
  const [items, setItems] = useState<DropItem[]>([]);
  const [busy, setBusy] = useState(false);
  useRevokePreviewsOnUnmount(items);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast("Vui lòng chọn ít nhất 1 ảnh", "error");
      return;
    }
    const fd = new FormData();
    for (const it of items) fd.append("images", it.file);
    fd.set("isActive", "1");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/site/banners", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error ?? "Tạo thất bại", "error");
        return;
      }
      toast(`Đã thêm ${data.banners.length} banner`, "success");
      onSaved(data.banners);
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-[var(--color-border-strong)] bg-zinc-900 p-4"
    >
      <MultiDropZone
        items={items}
        setItems={setItems}
        hint="PNG · JPG · WebP · GIF · AVIF · tối đa 15MB · tối đa 20 ảnh / lần"
        busy={busy}
      />
      <p className="text-[12px] text-[var(--color-text-dim)]">
        Banner mới sẽ tự bật. Sau khi tạo, bạn có thể gắn link và chỉnh tiêu đề ở danh sách bên dưới.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-[var(--color-border)] bg-zinc-900 px-4 py-1.5 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:opacity-50"
        >
          Huỷ
        </button>
        <button
          type="submit"
          disabled={busy || items.length === 0}
          className="rounded-lg bg-[var(--color-accent)] px-5 py-1.5 text-[12px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Đang tạo..." : `Tạo ${items.length || ""} banner`.trim()}
        </button>
      </div>
    </form>
  );
}

function BannerRow({
  banner,
  onUpdate,
  onDelete,
}: {
  banner: Banner;
  onUpdate: (b: Banner) => void;
  onDelete: (id: string) => void;
}) {
  const [linkUrl, setLinkUrl] = useState(banner.linkUrl ?? "");
  const [title, setTitle] = useState(banner.title ?? "");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  const dirty =
    linkUrl !== (banner.linkUrl ?? "") ||
    title !== (banner.title ?? "") ||
    pendingFile !== null;

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(f);
    setPendingPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      let res;
      if (pendingFile) {
        const fd = new FormData();
        fd.set("image", pendingFile);
        fd.set("linkUrl", linkUrl);
        fd.set("title", title);
        res = await fetch(`/api/admin/site/banners/${banner.id}`, { method: "PATCH", body: fd });
      } else {
        res = await fetch(`/api/admin/site/banners/${banner.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkUrl, title }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error ?? "Lưu thất bại", "error");
        return;
      }
      onUpdate(data.banner);
      if (fileRef.current) fileRef.current.value = "";
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
      setPendingFile(null);
      setPendingPreview(null);
      toast("Đã cập nhật", "success");
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/site/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error ?? "Lỗi", "error");
        return;
      }
      onUpdate(data.banner);
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Xoá banner này?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/site/banners/${banner.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("Xoá thất bại", "error");
        return;
      }
      onDelete(banner.id);
      toast("Đã xoá", "success");
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-zinc-900 p-4 ${
        banner.isActive ? "border-[var(--color-border)]" : "border-red-500/40 bg-red-500/10/30"
      }`}
    >
      <div className="grid gap-3 md:grid-cols-[200px_1fr_auto]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pendingPreview ?? banner.imageUrl}
          alt={banner.title ?? ""}
          className="h-24 w-full rounded-lg border border-[var(--color-border)] object-cover"
        />
        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề (tuỳ chọn)"
            className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Link khi click (vd: /products)"
            className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-[var(--color-border-strong)] bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {pendingFile ? "Đổi file khác" : "Đổi ảnh"}
            </button>
            {pendingFile && (
              <span className="truncate text-[11px] text-[var(--color-text-dim)]">
                {pendingFile.name}
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePick}
              className="hidden"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={busy || !dirty}
            onClick={handleSave}
            className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            Lưu
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleToggle}
            className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition disabled:opacity-50 ${
              banner.isActive
                ? "border-[var(--color-border)] bg-zinc-900 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                : "border-green-500/60 bg-zinc-900 text-green-300 hover:bg-green-500/10"
            }`}
          >
            {banner.isActive ? "Tắt" : "Bật"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className="rounded-lg border border-red-500/60 bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

function PopupTab({ initial }: { initial: Popup[] }) {
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[var(--color-text-dim)]">
          {items.length} popup. Chỉ popup đang bật mới nhất sẽ hiện cho khách.
        </span>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-[13px] font-semibold text-white transition hover:brightness-110"
          >
            + Thêm popup
          </button>
        )}
      </div>

      {adding && (
        <PopupCreateForm
          onSaved={(created) => {
            setItems((prev) => [...created, ...prev]);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-8 text-center text-[13px] text-[var(--color-text-dim)]">
          Chưa có popup nào.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <PopupRow
              key={p.id}
              popup={p}
              onUpdate={(np) => setItems((prev) => prev.map((x) => (x.id === np.id ? np : x)))}
              onDelete={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PopupCreateForm({
  onSaved,
  onCancel,
}: {
  onSaved: (created: Popup[]) => void;
  onCancel: () => void;
}) {
  const [items, setItems] = useState<DropItem[]>([]);
  const [activateFirst, setActivateFirst] = useState(false);
  const [busy, setBusy] = useState(false);
  useRevokePreviewsOnUnmount(items);

  const isSingle = items.length === 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast("Vui lòng chọn ít nhất 1 ảnh", "error");
      return;
    }
    const fd = new FormData();
    for (const it of items) fd.append("images", it.file);
    if (isSingle && activateFirst) fd.set("isActive", "1");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/site/popups", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error ?? "Tạo thất bại", "error");
        return;
      }
      toast(`Đã thêm ${data.popups.length} popup`, "success");
      onSaved(data.popups);
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-[var(--color-border-strong)] bg-zinc-900 p-4"
    >
      <MultiDropZone
        items={items}
        setItems={setItems}
        hint="PNG · JPG · WebP · GIF · AVIF · tối đa 10MB · tối đa 20 ảnh / lần"
        busy={busy}
      />
      <div className="text-[12px] text-[var(--color-text-dim)]">
        {isSingle ? (
          <label className="flex items-center gap-2 text-[13px] text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={activateFirst}
              onChange={(e) => setActivateFirst(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Hiển thị ngay sau khi tạo
          </label>
        ) : items.length > 1 ? (
          <span>
            Khi tạo nhiều popup, tất cả sẽ ở trạng thái <b>tắt</b>. Bật từng cái sau khi cần.
          </span>
        ) : (
          <span>Chọn ảnh để tạo popup mới.</span>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-[var(--color-border)] bg-zinc-900 px-4 py-1.5 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:opacity-50"
        >
          Huỷ
        </button>
        <button
          type="submit"
          disabled={busy || items.length === 0}
          className="rounded-lg bg-[var(--color-accent)] px-5 py-1.5 text-[12px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Đang tạo..." : `Tạo ${items.length || ""} popup`.trim()}
        </button>
      </div>
    </form>
  );
}

function PopupRow({
  popup,
  onUpdate,
  onDelete,
}: {
  popup: Popup;
  onUpdate: (p: Popup) => void;
  onDelete: (id: string) => void;
}) {
  const [linkUrl, setLinkUrl] = useState(popup.linkUrl ?? "");
  const [title, setTitle] = useState(popup.title ?? "");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  const dirty =
    linkUrl !== (popup.linkUrl ?? "") ||
    title !== (popup.title ?? "") ||
    pendingFile !== null;

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(f);
    setPendingPreview(f ? URL.createObjectURL(f) : null);
  };

  const save = async () => {
    setBusy(true);
    try {
      let res;
      if (pendingFile) {
        const fd = new FormData();
        fd.set("image", pendingFile);
        fd.set("linkUrl", linkUrl);
        fd.set("title", title);
        res = await fetch(`/api/admin/site/popups/${popup.id}`, { method: "PATCH", body: fd });
      } else {
        res = await fetch(`/api/admin/site/popups/${popup.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkUrl, title }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error ?? "Lỗi", "error");
        return;
      }
      onUpdate(data.popup);
      if (fileRef.current) fileRef.current.value = "";
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
      setPendingFile(null);
      setPendingPreview(null);
      toast("Đã cập nhật", "success");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/site/popups/${popup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !popup.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error ?? "Lỗi", "error");
        return;
      }
      onUpdate(data.popup);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Xoá popup này?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/site/popups/${popup.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("Lỗi", "error");
        return;
      }
      onDelete(popup.id);
      toast("Đã xoá", "success");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-zinc-900 p-4 ${
        popup.isActive ? "border-green-500/60 bg-green-500/10/30" : "border-[var(--color-border)]"
      }`}
    >
      <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pendingPreview ?? popup.imageUrl}
          alt={popup.title ?? ""}
          className="h-32 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] object-contain"
        />
        <div className="space-y-2">
          {popup.isActive && (
            <span className="inline-block rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-300">
              Đang hiển thị cho khách
            </span>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề (tuỳ chọn)"
            className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Link khi click"
            className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-[var(--color-border-strong)] bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {pendingFile ? "Đổi file khác" : "Đổi ảnh"}
            </button>
            {pendingFile && (
              <span className="truncate text-[11px] text-[var(--color-text-dim)]">
                {pendingFile.name}
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePick}
              className="hidden"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={busy || !dirty}
            onClick={save}
            className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            Lưu
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={toggle}
            className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition disabled:opacity-50 ${
              popup.isActive
                ? "border-[var(--color-border)] bg-zinc-900 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                : "border-green-500/60 bg-zinc-900 text-green-300 hover:bg-green-500/10"
            }`}
          >
            {popup.isActive ? "Tắt" : "Bật"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="rounded-lg border border-red-500/60 bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

