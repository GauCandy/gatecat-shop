import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/Toaster";
import { getSiteSettings } from "@/lib/site";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gatecat Shop — Mua sắm online",
  description: "Cửa hàng online — đồ công nghệ, phụ kiện, gadget chất lượng",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const heroBg = settings.heroBgUrl;

  return (
    <html
      lang="vi"
      className={`${inter.variable} ${mono.variable} ${serif.variable}`}
    >
      <body
        className="min-h-screen flex flex-col"
        {...(heroBg ? { "data-hero-bg": "" } : {})}
        style={heroBg ? { "--hero-bg-url": `url(${heroBg})` } as React.CSSProperties : undefined}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
