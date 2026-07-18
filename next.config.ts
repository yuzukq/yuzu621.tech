import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
