"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

type QuickEditFabProps = {
  siteName: string;
  logoUrl: string | null;
  marqueeItems: string[];
  heroBgUrl: string | null;
  heroShowcaseLabel: string;
  heroShowcaseText: string;
  heroShowcaseImageUrl: string | null;
};

export function QuickEditFab({
  siteName: initialSiteName,
  logoUrl: initialLogoUrl,
  marqueeItems: initialMarquee,
  heroBgUrl: initialHeroBgUrl,
  heroShowcaseLabel: initialShowcaseLabel,
  heroShowcaseText: initialShowcaseText,
  heroShowcaseImageUrl: initialShowcaseImageUrl,
}: QuickEditFabProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"general" | "marquee" | "hero">("general");
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── General tab ── */
  const [siteName, setSiteName] = useState(initialSiteName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  /* ── Marquee tab ── */
  const [marquee, setMarquee] = useState<string[]>(initialMarquee);

  /* ── Hero tab: background ── */
  const [heroBgUrl, setHeroBgUrl] = useState(initialHeroBgUrl);
  const [heroBgPreview, setHeroBgPreview] = useState<string | null>(initialHeroBgUrl);
  const [heroBgFile, setHeroBgFile] = useState<File | null>(null);
  const [removeHeroBg, setRemoveHeroBg] = useState(false);
  const heroBgInputRef = useRef<HTMLInputElement>(null);

  /* ── Hero tab: showcase ── */
  const [showcaseLabel, setShowcaseLabel] = useState(initialShowcaseLabel);
  const [showcaseText, setShowcaseText] = useState(initialShowcaseText);
  const [showcaseImageUrl, setShowcaseImageUrl] = useState(initialShowcaseImageUrl);
  const [showcaseImagePreview, setShowcaseImagePreview] = useState<string | null>(initialShowcaseImageUrl);
  const [showcaseImageFile, setShowcaseImageFile] = useState<File | null>(null);
  const [removeShowcaseImage, setRemoveShowcaseImage] = useState(false);
  const showcaseImageInputRef = useRef<HTMLInputElement>(null);

  /* ── Saving ── */
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── Handlers: General ── */
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setRemoveLogo(false);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  /* ── Handlers: Hero background ── */
  const handleHeroBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroBgFile(file);
    setRemoveHeroBg(false);
    const reader = new FileReader();
    reader.onload = () => setHeroBgPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveHeroBg = () => {
    setHeroBgFile(null);
    setHeroBgPreview(null);
    setRemoveHeroBg(true);
    if (heroBgInputRef.current) heroBgInputRef.current.value = "";
  };

  /* ── Handlers: Showcase image ── */
  const handleShowcaseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowcaseImageFile(file);
    setRemoveShowcaseImage(false);
    const reader = new FileReader();
    reader.onload = () => setShowcaseImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveShowcaseImage = () => {
    setShowcaseImageFile(null);
    setShowcaseImagePreview(null);
    setRemoveShowcaseImage(true);
    if (showcaseImageInputRef.current) showcaseImageInputRef.current.value = "";
  };

  /* ── Save handlers ── */
  const handleSaveGeneral = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.set("siteName", siteName);
      if (logoFile) form.set("logo", logoFile);
      if (removeLogo) form.set("removeLogo", "1");

      const res = await fetch("/api/admin/site/settings", {
        method: "PATCH",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi");

      setLogoUrl(data.settings.logoUrl);
      setLogoPreview(data.settings.logoUrl);
      setLogoFile(null);
      setRemoveLogo(false);
      showToast("Đã lưu cài đặt!");
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMarquee = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marqueeItems: marquee.filter((m) => m.trim()) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi");
      showToast("Đã lưu marquee!");
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHero = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.set("_action", "hero");
      // Background
      if (heroBgFile) form.set("heroBg", heroBgFile);
      if (removeHeroBg) form.set("removeHeroBg", "1");
      // Showcase text
      form.set("heroShowcaseLabel", showcaseLabel);
      form.set("heroShowcaseText", showcaseText);
      // Showcase image
      if (showcaseImageFile) form.set("heroShowcaseImage", showcaseImageFile);
      if (removeShowcaseImage) form.set("removeShowcaseImage", "1");

      const res = await fetch("/api/admin/site/settings", {
        method: "PATCH",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi");

      setHeroBgUrl(data.settings.heroBgUrl);
      setHeroBgPreview(data.settings.heroBgUrl);
      setHeroBgFile(null);
      setRemoveHeroBg(false);
      setShowcaseLabel(data.settings.heroShowcaseLabel);
      setShowcaseText(data.settings.heroShowcaseText);
      setShowcaseImageUrl(data.settings.heroShowcaseImageUrl);
      setShowcaseImagePreview(data.settings.heroShowcaseImageUrl);
      setShowcaseImageFile(null);
      setRemoveShowcaseImage(false);
      showToast("Đã lưu Hero!");
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const addMarqueeItem = () => setMarquee((prev) => [...prev, ""]);
  const removeMarqueeItem = (idx: number) =>
    setMarquee((prev) => prev.filter((_, i) => i !== idx));
  const updateMarqueeItem = (idx: number, value: string) =>
    setMarquee((prev) => prev.map((v, i) => (i === idx ? value : v)));

  return (
    <>
      {/* ── FAB ── */}
      <button
        type="button"
        aria-label="Quick Edit"
        onClick={() => setOpen((v) => !v)}
        className="qe-fab"
        data-open={open || undefined}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="qe-fab-icon"
        >
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          className="qe-backdrop"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Panel ── */}
      <div
        ref={panelRef}
        className={`qe-panel ${open ? "qe-panel-open" : ""}`}
        role="dialog"
        aria-label="Quick Edit Panel"
      >
        {/* Header */}
        <div className="qe-panel-header">
          <div className="qe-panel-title-group">
            <span className="qe-panel-label">⬢ QUICK EDIT</span>
            <h2 className="qe-panel-title">Chỉnh sửa nhanh</h2>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setOpen(false)}
            className="qe-panel-close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="qe-tabs">
          <button
            type="button"
            className={`qe-tab ${tab === "general" ? "qe-tab-active" : ""}`}
            onClick={() => setTab("general")}
          >
            ⬢ Chung
          </button>
          <button
            type="button"
            className={`qe-tab ${tab === "marquee" ? "qe-tab-active" : ""}`}
            onClick={() => setTab("marquee")}
          >
            ⬢ Marquee
          </button>
          <button
            type="button"
            className={`qe-tab ${tab === "hero" ? "qe-tab-active" : ""}`}
            onClick={() => setTab("hero")}
          >
            ⬢ Hero
          </button>
        </div>

        {/* Tab Content */}
        <div className="qe-panel-body">
          {tab === "general" && (
            <form onSubmit={handleSaveGeneral} className="qe-form">
              <div className="qe-field">
                <label htmlFor="qe-sitename" className="qe-label">Tên website</label>
                <input
                  id="qe-sitename"
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="qe-input"
                  placeholder="Gatecat Shop"
                  required
                />
              </div>

              <div className="qe-field">
                <span className="qe-label">Logo</span>
                <div className="qe-logo-area">
                  {logoPreview ? (
                    <div className="qe-logo-preview-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Logo preview" className="qe-logo-img" />
                      <button type="button" onClick={handleRemoveLogo} className="qe-logo-remove" aria-label="Xóa logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3 w-3">
                          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="qe-logo-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-6 w-6 text-zinc-500">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                  )}
                  <button type="button" onClick={() => logoInputRef.current?.click()} className="qe-logo-upload-btn">
                    {logoPreview ? "Thay đổi" : "Tải lên"}
                  </button>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" aria-hidden />
                </div>
              </div>

              <button type="submit" disabled={saving} className="qe-save-btn">
                {saving ? "⏳ Đang lưu..." : "⬢ LƯU THAY ĐỔI"}
              </button>
            </form>
          )}

          {tab === "marquee" && (
            <form onSubmit={handleSaveMarquee} className="qe-form">
              <p className="qe-hint">Các dòng chữ chạy ở trên cùng trang chủ.</p>
              <div className="qe-marquee-list">
                {marquee.map((item, idx) => (
                  <div key={idx} className="qe-marquee-row">
                    <span className="qe-marquee-idx">{String(idx + 1).padStart(2, "0")}</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateMarqueeItem(idx, e.target.value)}
                      placeholder="Nội dung..."
                      className="qe-input qe-input-grow"
                    />
                    <button type="button" onClick={() => removeMarqueeItem(idx)} className="qe-marquee-del" aria-label="Xóa">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addMarqueeItem} className="qe-add-btn">+ Thêm dòng</button>
              <button type="submit" disabled={saving} className="qe-save-btn">
                {saving ? "⏳ Đang lưu..." : "⬢ LƯU MARQUEE"}
              </button>
            </form>
          )}

          {tab === "hero" && (
            <form onSubmit={handleSaveHero} className="qe-form">
              {/* ─── Section 1: Background ─── */}
              <div style={{ borderBottom: "2px solid #27272a", paddingBottom: 20, marginBottom: 4 }}>
                <p className="qe-label" style={{ marginBottom: 12 }}>▸ Ảnh nền Hero</p>
                <p className="qe-hint" style={{ marginBottom: 12 }}>
                  Ảnh nền phần đầu trang chủ. Hiển thị cover + overlay tối.
                </p>

                {heroBgPreview ? (
                  <div className="qe-bg-preview-wrap" style={{ marginBottom: 8 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroBgPreview} alt="Background preview" className="qe-bg-preview-img" />
                    <div className="qe-bg-preview-overlay">
                      <span className="qe-bg-preview-label">BACKGROUND</span>
                    </div>
                    <button type="button" onClick={handleRemoveHeroBg} className="qe-logo-remove" aria-label="Xóa ảnh nền">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3 w-3">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="qe-bg-empty" style={{ marginBottom: 8, aspectRatio: "3/1" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-6 w-6 text-zinc-500">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span className="text-[10px] text-zinc-500 mc-mono uppercase tracking-widest">Chưa có</span>
                  </div>
                )}
                <button type="button" onClick={() => heroBgInputRef.current?.click()} className="qe-logo-upload-btn">
                  {heroBgPreview ? "⬢ ĐỔI ẢNH NỀN" : "⬢ TẢI ẢNH NỀN"}
                </button>
                <input ref={heroBgInputRef} type="file" accept="image/*" onChange={handleHeroBgChange} className="hidden" aria-hidden />
              </div>

              {/* ─── Section 2: Showcase card ─── */}
              <div>
                <p className="qe-label" style={{ marginBottom: 12 }}>▸ Showcase Card (ô bên phải)</p>
                <p className="qe-hint" style={{ marginBottom: 12 }}>
                  Ô hiển thị khi chưa có banner. Có thể chèn ảnh + text.
                </p>

                {/* Showcase label */}
                <div className="qe-field">
                  <label className="qe-label" style={{ fontSize: 9, letterSpacing: "0.35em" }}>Label (nhỏ, phía trên)</label>
                  <input
                    type="text"
                    value={showcaseLabel}
                    onChange={(e) => setShowcaseLabel(e.target.value)}
                    placeholder="NOW SHOWING"
                    className="qe-input"
                  />
                </div>

                {/* Showcase text */}
                <div className="qe-field" style={{ marginTop: 12 }}>
                  <label className="qe-label" style={{ fontSize: 9, letterSpacing: "0.35em" }}>Text chính (lớn)</label>
                  <input
                    type="text"
                    value={showcaseText}
                    onChange={(e) => setShowcaseText(e.target.value)}
                    placeholder="Bộ sưu tập đang được lắp ráp."
                    className="qe-input"
                  />
                </div>

                {/* Showcase image */}
                <div className="qe-field" style={{ marginTop: 12 }}>
                  <label className="qe-label" style={{ fontSize: 9, letterSpacing: "0.35em" }}>Ảnh showcase</label>
                  {showcaseImagePreview ? (
                    <div className="qe-bg-preview-wrap" style={{ aspectRatio: "5/4", marginBottom: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={showcaseImagePreview} alt="Showcase preview" className="qe-bg-preview-img" />
                      <div className="qe-bg-preview-overlay">
                        <span className="qe-bg-preview-label">SHOWCASE</span>
                      </div>
                      <button type="button" onClick={handleRemoveShowcaseImage} className="qe-logo-remove" aria-label="Xóa ảnh showcase">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3 w-3">
                          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="qe-bg-empty" style={{ aspectRatio: "5/4", marginBottom: 8 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-6 w-6 text-zinc-500">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      <span className="text-[10px] text-zinc-500 mc-mono uppercase tracking-widest">Chưa có</span>
                    </div>
                  )}
                  <button type="button" onClick={() => showcaseImageInputRef.current?.click()} className="qe-logo-upload-btn">
                    {showcaseImagePreview ? "⬢ ĐỔI ẢNH" : "⬢ TẢI ẢNH"}
                  </button>
                  <input ref={showcaseImageInputRef} type="file" accept="image/*" onChange={handleShowcaseImageChange} className="hidden" aria-hidden />
                </div>
              </div>

              <p className="qe-hint" style={{ fontSize: 10 }}>
                Tối đa 15MB (nền) / 10MB (showcase). PNG · JPG · WebP · GIF · AVIF.
              </p>

              <button type="submit" disabled={saving} className="qe-save-btn">
                {saving ? "⏳ Đang lưu..." : "⬢ LƯU HERO"}
              </button>
            </form>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="qe-toast">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
