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
    <p className="mc-mono mt-4 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
      ▸ AUTO-REDIRECT IN{" "}
      <span className="font-black text-orange-400">{remaining}s</span>
    </p>
  );
}
