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
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-body",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // default はブログ一覧(tech)がそのまま使う。他ページは title 指定時に template が適用される
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
        {/* ハードロード時、テーマ確定前の一瞬だけ既定の世界(tech)が見えて
            切り替わる「ちらつき」を防ぐため、最初のペイント前に同期実行する */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script {...jsonLdScriptProps(buildWebsiteJsonLd())} />
        {children}
      </body>
    </html>
  );
}
