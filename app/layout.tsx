import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AltMate - 原材料の産地・ルート可視化",
  description: "業種・原材料から輸出国を調べ、世界地図とサンキー図で可視化するツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
