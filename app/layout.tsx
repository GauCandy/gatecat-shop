import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gatecat Shop — Mua sắm online",
  description: "Cửa hàng online — đồ công nghệ, phụ kiện, gadget chất lượng",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
