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
