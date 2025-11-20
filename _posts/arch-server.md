---
slug: arch-server
title: Archを身内利用の快適クラウド化した話し
date: 2025-11-19
description: Arch Linux with samba環境をtailscaleでつないでdiscord botで疎通できる環境を構築した過程の備忘録です．
tags:
  - Arch Linux
  - ネットワーク関連
thumbnail: /images/blog/20251118/icatch_arch-server.png
---

# はじめに
今週は友人からの紹介もあり，Linux上で実行したいプログラムが出てきたためずっとArchを触ってる一週間になりました．その過程で，自宅内でのファイル共有，一部宅外の友人からのアクセスが必要になったため，試しに下記のような構成で試験的に運用を開始しました．今回はその実装過程の備忘録です．今回の構成では自宅内でのLinuxマシンとメインマシンでのファイルの受け渡しを主目的としています．(共有するユーザが今後増えた場合は[NextCloud](https://nextcloud.stylez.co.jp/blog/techblog/nextcloud-smb-fileserver.html)の導入を検討しています．)
![ネットワーク構成図](/images/blog/20251118/arch_diagram.png)
\\
また，宅外から友人が一時的に共有ドライブを利用する際に，私の自宅にあるサーバが利用可能な状態にあるのか，また共有されているコンテンツに更新が入ったか否かを手軽に確認できる環境を求めたため，コミュニティのDiscordチャンネルに常駐させるbotにてステータスの共有を行いました．このbotではプリセンスによるサーバの稼働/非稼働,ディレクトリ内のファイルの最終更新日時の確認．/コマンドでディレクト内のファイル一覧(ls)，リソース，ステータスなどの確認をモバイル端末から行えるようになりました．
![botのプレビュー](/images/blog/20251118/prev_bot.png)
