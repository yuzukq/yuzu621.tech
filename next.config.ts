import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // public/ の画像は Cache-Control: max-age=0 で配信され、既定(60秒)のままでは
    // 最適化済み画像がすぐ失効して再変換が繰り返される。差し替え時はファイル名を
    // 変える運用にして長く保持する
    minimumCacheTTL: 60 * 60 * 24 * 31,
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
};

export default nextConfig;
