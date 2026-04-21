"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function NotFoundRedirect({ seconds = 10 }: { seconds?: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const router = useRouter();

  useEffect(() => {
    if (remaining <= 0) {
      router.push("/");
      return;
    }
    const t = window.setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [remaining, router]);

  return (
    <p className="mt-4 text-[12px] text-[var(--color-text-dim)]">
      Tự động chuyển về trang chủ sau{" "}
      <span className="font-semibold text-[var(--color-text)]">{remaining}s</span>
    </p>
  );
}
