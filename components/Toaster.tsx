"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error";
};

type Listener = (t: Toast) => void;
const listeners = new Set<Listener>();

export function toast(message: string, type: Toast["type"] = "success") {
  const t: Toast = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now() + Math.random()),
    message,
    type,
  };
  for (const l of listeners) l(t);
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const listener: Listener = (t) => {
      setItems((prev) => [...prev, t]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== t.id));
      }, 3500);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[13px] shadow-lg backdrop-blur-sm ${
            t.type === "success"
              ? "border-green-200 bg-green-50/95 text-green-800"
              : "border-red-200 bg-red-50/95 text-red-800"
          }`}
        >
          <span className="mt-0.5 text-[14px]">
            {t.type === "success" ? "✓" : "⚠"}
          </span>
          <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
}
