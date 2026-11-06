import type { NextConfig } from "next";
import { EXTERNAL_IMAGE_HOSTS } from "./src/lib/external-image-hosts";

const nextConfig: NextConfig = {
  images: {
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
};

export default nextConfig;
