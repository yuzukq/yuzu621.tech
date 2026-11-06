import type { NextConfig } from "next";
import { EXTERNAL_IMAGE_HOSTS } from "./src/lib/external-image-hosts";

const nextConfig: NextConfig = {
  images: {
    // public/ の画像は Cache-Control: max-age=0 で配信され、既定(60秒)のままでは
    // 最適化済み画像がすぐ失効して再変換が繰り返される。差し替え時はファイル名を
    // 変える運用にして長く保持する
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: EXTERNAL_IMAGE_HOSTS.map((hostname) => ({ protocol: "https", hostname })),
  },
  async headers() {
    // ファイル名にハッシュが付いていないため immutable にはしない。差し替えるときは
    // ファイル名を変える(README「静的アセットのキャッシュ」参照)
    const cacheControl = {
      key: "Cache-Control",
      value: "public, max-age=86400, stale-while-revalidate=604800",
    };
    return [
      { source: "/images/:path*", headers: [cacheControl] },
      { source: "/models/:path*", headers: [cacheControl] },
    ];
  },
  async redirects() {
    return [
      {
        source: "/blog",
        destination: "/",
        permanent: true,
      },
      {
        // ポートフォリオ→プロフィールへの位置づけ変更に伴う旧URLの301
        source: "/portfolio",
        destination: "/profile",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      // 一覧を searchParams で分岐させると動的レンダリングになるため、公開URLは
      // /?category=daily のまま静的生成した /daily を返す。tech・不正値・指定なしは
      // rewrite せず静的な / (tech)になる
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "query", key: "category", value: "daily" }],
          destination: "/daily",
        },
      ],
    };
  },
};

export default nextConfig;
