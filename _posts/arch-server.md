---
slug: arch-server
title: Archを身内利用のお手軽クラウド化した話
date: 2025-11-19
description: Arch上のsamba環境をtailscaleでつないでdiscord botで疎通できる環境を構築した過程の備忘録です．
tags:
  - Arch Linux
  - ネットワーク関連
  - Samba
  - Tailscale
thumbnail: /images/blog/20251118/icatch_arch-server.png
---

# 1. はじめに
今週は友人からの紹介もあり，Linux上で実行したいプログラムが出てきたためずっとArchを触ってる一週間になりました．その過程で，自宅内でのファイル共有，一部宅外の友人からのアクセスが必要になったため，[Tailscale](https://tailscale.com/)で疑似的なVPN構成で試験的に運用を開始しました．今回はその実装過程の備忘録です．今回の構成では自宅内でのLinuxマシンとメインマシンでのファイルの受け渡しを主目的としています．(共有するユーザが今後増えた場合は[NextCloud](https://nextcloud.stylez.co.jp/blog/techblog/nextcloud-smb-fileserver.html)の導入を検討しています．)下記は今回のネットワーク構成図です．
![ネットワーク構成図](/images/blog/20251118/arch_diagram.png)
\\
また，宅外から友人が一時的に共有ドライブを利用する際に，私の自宅にあるサーバが利用可能な状態にあるのか，また共有されているコンテンツに更新が入ったか否かを手軽に確認できる環境を求めたため，コミュニティのDiscordチャンネルに常駐させるbotにてステータスの共有を行いました．このbotではプリセンスによるサーバの稼働/非稼働,ディレクトリ内のファイルの最終更新日時の確認．/コマンドでディレクト内のファイル一覧(ls)，リソース，ステータスなどの確認をモバイル端末から行えるようになりました．
![botのプレビュー](/images/blog/20251118/prev_bot.png)

### 実装時の環境
サーバ側になるコンピュータにsambaを導入します．環境は以下の通りです．

- **CPU**: Intel(R) Core(TM) i7-6700
- **Kernel**: 6.7.7-arch1-1
- **Architecture**: x86_64
- **Samba**: 2:4.23.3-2
\\
# 2. 導入
pacmanでインストールします．
```bash
sudo pacman -S samba
```
現在ログインしているシステムユーザ(自分のアカウント)でsambaを利用するためのパスワードを設定します( -a オプションはユーザーを追加し自動的に有効化するためのオプションです)．クライアントのwinでログイン時に使用します．忘れないように．
```bash
sudo smbpasswd -a [user-name]
```
## 2.1 Samba Shareの構築
自分以外のユーザーに使用してもらうためのシステムユーザを作成します．sambaでは独自にログイン用のユーザが作られるわけではなく，Linux側のシステムユーザを用意，ユーザグループを作成してアクセス権限の付与を行うことにしました．\\
2.1.1 ユーザーグループを作成します(今回はArchUserと命名しました)．
```bash
sudo groupadd ArchUser
```
(1) ユーザを作成してグループに登録します．今回はvisitorとします．きっとボスも笑ってくれます() 
```bash
# -r: システムユーザーとして作成, -g: プライマリグループにArchUserを指定, -s: ログインシェルを無効化
sudo useradd -r -g ArchUser -s /sbin/nologin visitor
```
(2) visitor(システムユーザ)のパスワードを登録します．
```bash
sudo passwd visitor
```
(3) visitorで共有ディレクトリにアクセスしてもらうためのパスワードを登録します．
```bash
sudo smbpasswd -a visitor
```
(4) 自身もユーザーグループに登録します．
```bash
# -aG: ユーザーを既存のセカンダリグループに追加
sudo usermod -aG ArchUser myuser
```

### 2.1.2 共有ディレクトリへの権限設定
今回はhomeディレクトリ内に`/home/yuzu/Share`を作成し，そこを共有ディレクトリにすることにしました．Linuxファイルシステム側の権限設定で，先ほど作成したユーザーグループでの読み書きを許可します．
```bash
# 所有グループを ArchUser に変更
sudo chgrp ArchUser /home/yuzu/Share
```
```bash
# 所有者rwx, グループrwx, その他r-x
sudo chmod 775 /home/yuzu/Share
```
次にSamba側の設定を行います．これらの設定は`/etc/samba/smb.conf`を編集することで設定できます．任意のエディタで編集します．
```bash
sudo vi /etc/samba/smb.conf
```
中身は下記の通り編集しています．
```bash
[ArchShare]
comment = Arch Linux Shared Folder
path = /home/yuzu/share
browseable = yes
writable = yes

valid users = @ArchUser # ArchUserのみアクセスを許可
create mask = 0664 # 新規ファイルの権限 (所有者:rw, グループ:rw, その他:r)
directory mask = 0775 # 新規ディレクトリの権限 (所有者:rwx, グループ:rwx, その他:rx)

[global]
bind interfaces only = no # 後述するtailscale0インターフェースを含むため
log level = 3 # 認証試行などの詳細ログを見るため
```

### 2.1.3 システムの永続化とローカルアクセス
外部アクセスを行うためのファイアウォールの解放を行います．sambaが使用するポートはTCP:139,445, UDP:137,138となっています．
```bash
sudo ufw allow samba
```
次にsystemdを使用してSambaの初期起動を有効化・管理します．Sambaは通常2つのデーモン (smbd と nmbd) で構成されているため，これらを有効化します．
```bash
sudo systemctl enable smbd.service
sudo systemctl enable nmbd.service
```
ipconfig等で確認したサーバ側のマシンのipにクライアント側から接続することでローカルアクセスは可能になりました．\\
エクスプローラにて`\\[ローカルIP]\ArchShare`に接続できます．初回はログインを求められるので自身のシステムユーザ名と先ほど設定したsambaのパスワードを使用してください．

## 2.2 Tailscaleの導入と設定
　Tailscaleは，複雑なネットワーク設定なしに安全なプライベートネットワークを構築できるVPNソリューションです[[1](https://tailscale.com/)]．WireGuardプロトコルをベースとし，デバイス同士をP2P接続でメッシュネットワークとして繋げる仕組みが採用されています．\\ \\
従来のVPNでは，自宅ルータの固定グローバルIPアドレスを持ったプロバイダ回線の契約，ブリッジの設定やポート開放といった複雑な作業が必要でした．
　しかしTailscaleを使えば，接続したい端末にTailscaleクライアントをインストールし，同じアカウントでログインするだけで，E2Eの暗号化された通信路が自動的に確立されます．​
\\ \\
各デバイスには100.x.x.x形式のプライベートIPアドレスや(端末名).tailXXXXXX.ts.netというホスト名が割り当てられ，このアドレスを使って自宅クラウドへのSSH接続やWebインターフェースへのアクセスが可能になります．今回のような個人利用であれば無料プランでも十分な機能が利用でき，設定も非常にシンプルなため，ネットワークの専門知識がなくても導入できるのが大きな魅力だと考えています．​

### 2.2.1 サーバ側への導入
pacmanで導入，永続化します．
```bash
sudo pacman -S tailscale
sudo systemctl enable --now tailscaled
```
tailscaleを下記のコマンドにより実行すると，ログイン用のURLが出力されるためブラウザでログインします．今回はGUI環境で利用しましたが，CUIでも別の端末から認証が可能です．コンソールにLogin successfulを出力されれば成功です．
### 2.2.2 クライアント側の導入
Tailscaleのクライアント用[アプリケーション](https://tailscale.com/download)をダウンロードします．自身の環境に合わせてOSを選択し，インストーラに従ってインストールします．サーバ側の設定の時同様ブラウザでログイン画面が立ち上がるのでログインします．自身で使用している同一のTailscaleアカウントでログインした場合，端末は自動でTailnetに登録されます．\\接続している端末の状態は[管理画面](https://login.tailscale.com/admin/machines)にて確認でき，Tailnet内で割り当てられているipアドレスの確認，編集等ができます．
![tailscale管理画面](/images/blog/20251118/prev_tailscale.png)
サーバとして接続しているコンピュータに割り振られたtailnet上のipアドレス(ここでは100.94.6.111)に接続することで，自宅外部のLanに接続した状態であっても，Tailscaleを経由して自宅のファイルサーバにアクセスすることができます...!\\
↓Windowsクライアントで共有ディレクトリを登録する方法(先ほどローカルアクセスで使用していたipを今回のものに置き換えます．)
![エクスプローラへの登録](/images/blog/20251118/prev_exp.png)

### 2.2.3 自分以外へのファイル共有
上記管理画面のサーバとして利用しているコンピュータの欄からシェアボタンを押すことで招待リンクの作成が可能です．共有相手が相手自身のTailscaleアカウントで承認することでサーバマシンへの接続ができるようになります．前節で作成したシステムユーザ(visitor)を利用して共有ファイルに読み書きをすることが出来ます．\\ \\
**余談**\\
Tailscaleで接続したVPNではもちろんのことファイル共有だけでなく，SSHのような他プロトコルでの疎通も可能です．今後の記事ではwayland環境(ウィンドウマネージャ)でのリモートデスクトップ接続を行った試みについても残していこうと思っています．\\
(参考:SSHの設定手順)
```bash
# サーバ側
sudo pacman -S openssh
sudo systemctl enable --now sshd
sudo ufw allow ssh

# クライアント側接続時
#   [システムユーザ名]@[Tailnet上のip]
ssh yuzu@100.94.6.111
```

## 2.3 疎通用Discord botの稼働
最後にサーバステート共有用のbot導入の概要です．なおtokenの取得，チャンネルへの追加方法については割愛します．詳細の導入手順については[Readme](https://github.com/yuzukq/ArchWatchdog)を閲覧してください．\\
今回のbotの目的は，コミュニティ内の共有ディレクトリを利用する友人たちが，サーバを利用できる状況にあるかどうか，ファイルの更新状況について端末を問わず気軽に確認することにありました．\\

そのため，botを参加させたチャンネルからのスラッシュコマンドを受け取り`ls`などをLinux側で実行して出力を返す，また定期的にファイルの最終更新日時を取得してbotに表示しているPresence（ステータス）を更新することで，サーバの状態を提示するような仕組みでこれを実現しています．\\

### 2.3.1 実現方法
サーバの状態確認やファイル一覧の取得といった機能は，Pythonの`subprocess`モジュールを使用してLinuxのシェルコマンドを直接実行し，その標準出力をDiscordに返却することで実現しています．

以下は，共有ディレクトリの中身を表示する`/ls`コマンドの実装例です．`subprocess.run`を用いて`ls -lhAF`コマンドを実行し，結果を取得しています．

```python
    @client.tree.command(name="ls", description="共有ディレクトリの一覧を表示します")
    async def share_command(interaction: discord.Interaction):
        """shareディレクトリの内容を表示するコマンド"""
        share_path = "/home/yuzu/share/"
        
        try:
            # ls -lhAF --color=never
            result = subprocess.run(
                ["ls", "-lhAF", "--color=never", share_path],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            # ... (エラーハンドリングや出力の整形処理)

            message = header + output + footer
            await interaction.response.send_message(message, ephemeral=False)
```

また，ファイルの更新状況を常に可視化するために，`discord.ext.tasks`を用いて5分ごとにディレクトリの最終更新日時をチェックし，Botのステータス（Presence）に反映させています．これにより，Discordのメンバーリストを見るだけで，サーバが稼働しているか，いつファイルが更新されたかが一目で分かります．

```python
    # プリセンスの定期更新
    @tasks.loop(minutes=5)
    async def update_presence(self):
        last_modified = self.get_last_modified_time()
        activity = discord.Activity(
            type=discord.ActivityType.playing,
            name="接続可能✅️",
            state=f"ファイルの最終更新: {last_modified}",
        )
        await self.change_presence(activity=activity)
```

このように，既存のLinuxコマンドとDiscord Botを組み合わせることで，専用の監視ツールを導入せずとも，身内用の手軽なサーバ監視・管理環境を構築しています．

# 3. おわりに
今回はArch Linuxをベースに，Sambaでのファイル共有，Tailscaleによる外部アクセス，Discord Botによるステータス監視を検証しました．次週以降はnextcloudの導入やhomeassistantを使ったiot制御で遊んでみる予定でいます．今後も学業や就職活動と程よく両立しつつ，趣味で得られた学びを継続してアウトプットしていきたいと思います...!


