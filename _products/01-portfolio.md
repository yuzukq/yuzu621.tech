---
id: portfolio
title: Portfolio Website
thumbnail: /images/products/portfolio/thumb_portfolio.png
techStack:
  - Next.js
  - TypeScript
  - Chakra UI
  - Vercel
description: 大学生活の活動をまとめた、Next.jsとMarkdownブログ管理を組み合わせた個人ポートフォリオサイト。
screenshots:
  - /images/products/portfolio/thumb_portfolio.png
  - /images/products/portfolio/prev_blog.png
  - /images/products/portfolio/prev_git.png
  - /images/products/portfolio/prev_gitGraph.png
urls:
  github: https://github.com/yuzukq/portfolio
  website: https://yuzuportfolio.vercel.app/
---

はじめての長期インターンではNext.jsを用いたフロントエンド開発を行いました。モダンなフレームワークを利用する中で、コンポーネント分割の粒度、保守・拡張性を考慮した設計思想、OSSデザインシステムの効率的な活用方法について学びました。これらの知見を活かした振り返りもかね、これまでの大学生活の活動のアウトプットを目的に、当プロダクトの開発を行いました。開発にはgithub copilotをはじめとしたエージェントの活用や、マージ前のcursor bug botなどのAIワークフローを使ったレビュー、本番環境とインテグレーションを分離したブランチ管理で共同開発でも実際に行われる開発フローを意識しました。また、ブログを管理するプロジェクトとしての役割も担っており、rehypeを用いたマークダウンパースによりNext.js上での静的ページ生成を実現しています。これにより、git上での記事管理とデプロイの自動化を実現しています。

## 主な機能

- レスポンシブデザイン
- アニメーション効果
- Markdownによるブログ記事管理
- Vercelによる継続的デプロイメント

## 工夫点・課題

- モダンフレームワークを利用した開発
- パフォーマンス最適化
- コンポーネント分割のベストプラクティスの模索
- OSSデザインシステム(Chakra UI v3)の活用
