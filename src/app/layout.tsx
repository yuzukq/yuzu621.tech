import type { Metadata } from "next";
import { Space_Grotesk, Zen_Maru_Gothic, JetBrains_Mono } from "next/font/google";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  buildWebsiteJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";
import "./globals.css";

// 欧文ディスプレイ(見出し・ラベル) — DESIGN.md §3
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

// 和文本文・見出し — DESIGN.md §3
// 丸ゴシック。かわいさと本文可読性の両立でZen Kaku Gothic Newから変更。
const zenMaruGothic = Zen_Maru_Gothic({
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
  metadataBase: new URL(SITE_URL),
  // ブログ一覧(tech)は絶対タイトルの SITE_TITLE を明示指定する。
  // それ以外(記事・日常カテゴリ・プロフィール等)がタイトルを指定した場合は template が適用される。
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: DEFAULT_OG_IMAGE_PATH }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
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
      className={`${spaceGrotesk.variable} ${zenMaruGothic.variable} ${jetBrainsMono.variable}`}
    >
      <body className="bg-bg font-body text-ink antialiased">
        <script {...jsonLdScriptProps(buildWebsiteJsonLd())} />
        {children}
      </body>
    </html>
  );
}
