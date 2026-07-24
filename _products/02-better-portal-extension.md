---
id: better-portal-extension
title: Better Portal Extension
thumbnail: /images/products/better-portal-extension/thumb_betterPortalExtension.png
techStack:
  - HTML
  - CSS
  - JavaScript
  - Chrome Extension API
description: 大学ポータルサイトのUI/UXを改善するChrome拡張機能．
screenshots:
  - /images/products/better-portal-extension/prev_betterPortalExtension_1.png
  - /images/products/better-portal-extension/prev_betterPortalExtension_2.png
  - /images/products/better-portal-extension/prev_button.png
  - /images/products/better-portal-extension/prev_viewer.png
  - /images/products/better-portal-extension/prev_timestamp.png
urls:
  github: https://github.com/yuzukq/Better-Portal-Extension
  demo: https://chromewebstore.google.com/detail/eioioildkjhlbeoaikbhhajncblbmnmh?utm_source=item-share-cb
---

大学で運用されているポータルサイトのUI/UXを改善するために開発したChrome拡張機能です．所属大学で運用されているポータルサイトは，ウィンドウ操作のUXに関する不満や，大学側から提供されているコンテンツに対する導線の悪さが教員，学生から声が揚げられていました．これらの課題を解決するためにChrome拡張機能という形でクライアントサイドで動的にUIの変更を実現しました．google web storeにて公開中のページからインストールするのみでこの機能を利用することが出来ます．

## 主な機能

- アイコンサイズ変更時のリアルタイムフィードバック
- ストアからインストールするだけで利用可能
- 大学から提供されている複数コンテンツへのショートカットを提供

## 工夫点・課題

- Chrome Extension APIの習得
- 非エンジニア層が利用できるようにGUIデザインを工夫
- ページ実装時に今後の拡張性を重視してステートマシンによるページ管理を実現
