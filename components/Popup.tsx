"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PopupData = {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  title: string | null;
};

const STORAGE_KEY = "gatecat-popup-dismissed";

export function Popup() {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/popup/active")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const p = data?.popup;
        if (!p) return;
        const dismissed = window.localStorage.getItem(STORAGE_KEY);
        if (dismissed === p.id) return;
        setPopup(p);
        setOpen(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => {
    if (popup) {
      try {
        window.localStorage.setItem(STORAGE_KEY, popup.id);
      } catch {}
    }
    setOpen(false);
  };

  if (!popup || !open) return null;

  const content = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={popup.imageUrl}
      alt={popup.title ?? ""}
      className="block h-auto max-h-[80vh] w-auto max-w-full object-contain"
    />
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={close}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/85 p-4 backdrop-blur-sm"
    >
      <div
        className="relative max-h-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Đóng"
          className="absolute -right-3 -top-3 z-10 grid h-10 w-10 place-items-center border-2 border-zinc-700 bg-orange-500 text-[16px] font-black text-zinc-950 shadow-[3px_3px_0_#09090b] transition hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#09090b]"
        >
          ✕
        </button>
        {popup.linkUrl ? (
          <Link href={popup.linkUrl} onClick={close} className="block">
            {content}
          </Link>
        ) : (
          content
        )}
        {popup.title && (
          <p className="mc-mono mt-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400 drop-shadow">
            ⬢ {popup.title}
          </p>
        )}
      </div>
    </div>
  );
}
