import type { Metadata } from "next";
import { Space_Grotesk, Zen_Kaku_Gothic_New, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 欧文ディスプレイ(見出し・ラベル) — DESIGN.md §3
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

// 和文本文・見出し — DESIGN.md §3
const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-body",
  display: "swap",
});

// コード — DESIGN.md §3
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yuzu portfolio",
  description: "Yuzu のポートフォリオサイト。制作物、技術ブログ、スキル・経歴を公開しています。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      data-world="tech"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${zenKakuGothicNew.variable} ${jetBrainsMono.variable}`}
    >
      <body className="bg-bg font-body text-ink antialiased">{children}</body>
    </html>
  );
}
