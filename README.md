# yuzu621.tech - Portfolio & Blog

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra_UI-3.24-319795?style=for-the-badge&logo=chakra-ui)](https://chakra-ui.com/)
[![Rehype](https://img.shields.io/badge/Rehype-Plugins-8B5CF6?style=for-the-badge&logo=markdown)](https://github.com/rehypejs/rehype)
[![Playwright](https://img.shields.io/badge/Playwright-1.48-2EAD33?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions)](https://github.com/features/actions)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

Next.jsを採用し、コンポーネント設計・データドリブンな設計思想・CI/CD完備のポートフォリオ兼ブログサイトです。
[リンク](http://yuzu621.tech/)
##  主な特徴

### コンポーネント設計
- **細粒度のコンポーネント分割**: 再利用性と保守性を重視した設計
- **データドリブンアーキテクチャ**: `src/data/`内のデータを変更するだけでフロントエンドに反映
- **レスポンシブデザイン**: デスクトップ・モバイルの両方に最適化

### Markdownベースのブログシステム
- **静的サイト生成**: `_posts/`にMarkdownファイルを配置するだけで記事公開
- **高機能パーサー**: 
  - `remark-gfm`: GitHub Flavored Markdown対応
  - `rehype-prism-plus`: シンタックスハイライト
  - `rehype-slug` + `rehype-autolink-headings`: 見出しの自動リンク生成
  - カスタムプラグイン: LaTeX数式の改行処理に対応
- **メタデータ管理**: gray-matterによるフロントマター解析

###  CI/CD & テスト戦略
- **GitHub Actions**: 自動化されたCI/CDパイプライン
  - ESLint: コード品質チェック
  - TypeScript: 型チェック
  - Next.js Build: ビルドエラー検出
  - Link Check: Markdownリンクの検証
  - npm audit: 依存関係の脆弱性スキャン
- **Playwright E2E**: 本番同等の環境での自動E2Eテスト
- **Vercel**: プレビューデプロイ & 本番デプロイの自動化

###  データビジュアライゼーション
- Recharts & Chakra UI Chartsを用いたスキル可視化
- レーダーチャート、タイムライン表示など


## 📁 プロジェクト構造

```
yuzu621.tech/
├── _posts/                    # Markdownブログ記事
│   ├── start-blog-with-markdown-parser.md
│   ├── vr-seminar.md
│   └── windows-rice.md
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx          # トップページ
│   │   ├── layout.tsx        # ルートレイアウト
│   │   └── blog/             # ブログ関連ページ
│   │       ├── page.tsx      # 記事一覧
│   │       └── [slug]/       # 動的ルーティング
│   ├── components/            # Reactコンポーネント
│   │   ├── sections/         # セクションコンポーネント
│   │   ├── layouts/          # レイアウトコンポーネント
│   │   ├── blog/             # ブログコンポーネント
│   │   └── ui/               # UIコンポーネント
│   ├── data/                  # データソース（データ駆動設計）
│   │   ├── products.ts       # プロダクト情報
│   │   ├── skills.ts         # スキル情報
│   │   ├── stories.ts        # ストーリー情報
│   │   └── studies.ts        # 学習情報
│   ├── lib/                   # ユーティリティ
│   │   ├── posts.ts          # Markdown記事処理
│   │   └── remark-latex-breaks.ts  # カスタムremarkプラグイン
│   └── hooks/                 # カスタムフック
├── tests/
│   └── e2e/                   # Playwright E2Eテスト
│       ├── blog.spec.ts
│       ├── home.spec.ts
│       ├── navigation.spec.ts
│       └── product.spec.ts
├── .github/
│   └── workflows/
│       └── ci.yml             # CI/CDパイプライン
└── public/                    # 静的アセット
```


##  ブログ記事の追加方法

1. `_posts/`ディレクトリに新しいMarkdownファイルを作成
2. フロントマターを記述:

```markdown
---
title: "記事タイトル"
date: "2025-11-17"
description: "記事の説明"
tags: ["Next.js", "React"]
thumbnail: "/images/blog/thumbnail.png"
---

ここから本文...
```

3. ファイルを保存してコミット
4. Vercelが自動的にビルド & デプロイ

##  設計思想

### データドリブン設計
`src/data/`内のデータファイルを編集するだけで、フロントエンドに自動反映される設計を採用。新しいプロダクトやスキルの追加時にコンポーネントの変更は不要です。

**例**: `src/data/products.ts`に新しいプロダクトオブジェクトを追加するだけで、自動的にプロダクトカードが生成されます。

### コンポーネント分割の粒度
- **Atomic Design的アプローチ**: インターンでの学びを生かし、UI要素を適切な粒度で分割
- **Section単位**: 各セクション（About, Skills, Products等）を独立したコンポーネントに
- **レイアウトの分離**: ヘッダー・フッター・メインレイアウトを分離し、ページ間で再利用

### Markdownファースト
記事管理はGit上で完結。CMSを使わずMarkdownファイルでコンテンツを管理することで、バージョン管理とレビューが容易になります。

##  CI/CDパイプライン

プルリクエストおよび特定ブランチへのプッシュ時に自動実行:

1. **静的解析**: ESLintによるコード品質チェック
2. **型チェック**: TypeScriptによる型安全性確認
3. **ビルド検証**: Next.jsビルドの成功確認
4. **リンク検証**: Markdownファイル内のリンク切れチェック
5. **脆弱性監査**: npm auditによる依存関係のセキュリティチェック
6. **E2Eテスト**: Playwrightによる自動UI・機能テスト
7. **コードレビュー** : Github copilotによるコードレビュー

すべてのチェックが通過した後、Vercelが自動デプロイを実行します。

##  開発フロー

- **ブランチ戦略**: 
  - `main`: 本番環境
  - `develop`: 開発統合環境
  - `feature/*`, `ci/*`: 機能追加・CI改善用ブランチ
- **レビュープロセス**: AI支援レビュー（Cursor Bug Bot等）を活用
- **デプロイ**: Vercel統合による自動プレビュー & 本番デプロイ

##  Author

**yuzukq**
- Portfolio: [https://yuzu621.tech](https://yuzu621.tech)
- GitHub: [@yuzukq](https://github.com/yuzukq)

---

*Built with ❤️ using Next.js and modern web technologies*
