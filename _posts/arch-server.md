---
slug: arch-server
title: Archを身内利用の快適クラウド化した話し
date: 2025-11-17
description: Arch Linux with samba環境をtailscaleでつないでdiscord botで疎通できる環境を構築した過程の備忘録です．
tags:
  - Arch Linux
  - ネットワーク関連
thumbnail: /images/blog/20251108/vr-seminar_icatch.png
---

# はじめに
今週は友人からの紹介もあり，Linux上で実行したいプログラムが出てきたためずっとArchを触ってる一週間になりました．その過程で，自宅内でのファイル共有，一部宅外の友人からのアクセスが必要になったため，試しに下記のような構成で試験的に運用を開始しました．今回はその実装過程の備忘録です．
![ネットワーク構成図](/images/blog/20251118/arch_diagram.png)
