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

## Sambaの導入と設定
サーバ側になるコンピュータにsambaを導入します．環境は以下の通りです．

- **CPU**: Intel(R) Core(TM) i7-6700
- **Kernel**: 17.7-arch1-1
- **Architecture**: x86_64
- **Samba**: 2:4.23.3-2
\\
### 1．導入
pacmanでインストールします．
```bash
sudo pacman -S samba
```
現在ログインしているシステムユーザ(自分のアカウント)でsambaを利用するためのパスワードを設定します( -a オプションはユーザーを追加し自動的に有効化するためのオプションです)．クライアントのwinでログイン時に使用します．忘れないように．
```bash
sudo smbpasswd -a [user-name]
```
### 2．共有化のための事前準備
自分以外のユーザーに使用してもらうためのシステムユーザを作成します．sambaでは独自にログイン用のユーザが作られるわけではなく，linux側のシステムユーザを用意，ユーザグループを作成してアクセス権限の付与を行うことにしました．\\
2.1 ユーザーグループを作成します(今回はArchUserと命名しました)．
```bash
sudo groupadd ArchUser
```
2.2 ユーザを作成してグループに登録します．今回はvisitorとします．きっとボスも笑ってくれます() 
```bash
# -r: システムユーザーとして作成, -g: プライマリグループにArchUserを指定, -s: ログインシェルを無効化
sudo useradd -r -g ArchUser -s /sbin/nologin visitor
```
2.3 visitor(システムユーザ)のパスワードを登録します．
```bash
sudo passwd visitor
```
2.4 visitorで共有ディレクトリにアクセスしてもらうためのパスワードを登録します．
```bash
sudo smbpasswd -a visitor
```
2.5 自身もユーザーグループに登録します．
```bash
# -aG: ユーザーを既存のセカンダリグループに追加
sudo usermod -aG ArchUser myuser
```

### 共有ディレクトリへの権限設定
今回はhomeディレクトリ内に`/home/yuzu/Share`を作成し，そこを共有ディレクトリにすることにしました．Linuxファイルシステム側の権限設定で，先ほど作成したユーザーグループでの読み書きを許可します．
```bash

```











共有ディレクトリの設定，アクセス権限の設定を行っていきます．これらの設定は`/etc/samba`

```bash
# ----------------------------------------------------
# ArchUser グループ限定の共有設定
# ----------------------------------------------------
[ArchShare]
   comment = Shared Folder for ArchUser Group
   path = /srv/samba/arch_share
   browseable = yes
   writable = yes
   
   # **重要**: アクセスを @グループ名 のメンバーのみに限定します
   valid users = @ArchUser
   
   # 作成されるファイルとディレクトリのパーミッション
   create mask = 0664
   directory mask = 0775
   
   # setgidビットと連携し、グループによるファイル共有を容易にします
   force group = ArchUser
   ```