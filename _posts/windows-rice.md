---
slug: windows-rice
title: RiceはLinuxだけの嗜みじゃない!! winで利用可能なウィンドウマネージャとタブバーの紹介[yasb, GlazeWM]
date: 2025-10-28
description: waylandのような美しいタイリングマネージャをwindowsで利用できる，GlazeWMというOSS．yasbというタブバーの導入とセットアップを紹介します．
tags:
  - GlazeWM
  - Yasb
  - r/desktop
thumbnail: /images/blog/20251029/thumb.png
category: tech
---
# はじめに
　この記事では下記のようなデスクトップ環境をwindows11で構築するために利用したOSSやセットアップ，カスタマイズ方法についてご紹介します！
![Preview](/images/blog/20251029/desktop_prev.png)

### 経緯
　Unixの各種DEやi3/HyprlandなどのWMを触る中で，見た目を作り込む「[Rice](https://www.reddit.com/r/linuxquestions/comments/mb9q1r/what_is_ricing_in_linux/?tl=ja&utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button)」に惹かれました．軽量で美しいタイリングとキーボード中心の操作性に魅力を感じ，ラップトップをネイティブArchで常用することを検討していました．

### 研究室配属
しかし私が配属された研究室ではPowerPoint投影や配布Wordテンプレの厳守が必須．結果としてWindowsをメインに据えつつ，Linuxライクなタイリング環境を求めることに．そこで辿り着いたのが「GlazeWM」と「Yasb Reborn」です．

# 環境構築
　ここからは導入編に入ります．
## ウィンドウマネージャー: GlazeWM
![GlazeWM](/images/blog/20251029/glazewm_git.png)
 [GlazeWM](https://github.com/glzr-io/glazewm)は[i3](https://wiki.archlinux.jp/index.php/I3)から着想を得て作られたオープンソースのWindows用タイリングウィンドウマネージャです．キーボード操作によるコマンドでウィンドウを簡単に整理し，そのレイアウトをリアルタイムで調整することが出来ます．\\
他にもWindowsで利用可能なタイリングウィンドウマネージャとしてはHyprlandライクな[komorebi](https://github.com/LGUG2Z/komorebi)などがありますが，設定のわかりやすさとLinux経験者からの声でより安定性が高く評価されたGlazeWMを使用しています．

### 導入
　GlazeWMのインストールはwingetでの取得と，githubからダウンロードしたインストーラーを使用する二種類の方法で導入可能です．\\
wingetを利用する場合はpowershellを起動し，

```bash
winget install glazewm
```
を実行．インストーラーを利用する場合は[リリースページ](https://github.com/glzr-io/glazewm/releases)にアクセスし，最新のリリースからインストーラをダウンロード
![インストーラのダウンロード](/images/blog/20251029/installer_download.png)
ダウンロードが完了したらインストーラを実行します．実行すると下記のようなウィンドウが起動し，一緒にZebarと呼ばれるタブバーをインストールするかどうか問われます．今回は前述のとおり，Yasbというタブバーを使用するため，「Install Zebar (recommended)」のチェックを**外します**.
チェックを外して「install」をクリックして正常に実行されれば導入は完了です！
![インストール](/images/blog/20251029/installer_check.png)

### コンフィグファイルの変更
　コンフィグファイルの変更必須箇所と，主要パラメータを抜粋してご紹介します．また，これから行う変更を加えた私が使用しているコンフィグファイルは[こちら](https://github.com/yuzukq/dotfiles/blob/main/laptop-windows/.glzr/glazewm/config.yaml)から閲覧可能です．よろしければご活用ください．
GlazeWMの導入が完了したら~(ユーザーのホームディレクトリ)直下に`.glzr`が生成されます． スタートメニューからGlazeWMを起動してください．実行後，タスクバー右側のタスクトレイにGlazeWMが表示されます．これを押下することでコンフィグファイルへアクセスが出来ます(直接`C:\Users\[yourName]\.glzr\glazewm`を開いてもかまいません)．またこの時，wingetでインストールしてる場合は`.glzr`に`zebar`のコンフィグディレクトリが一緒に生成されている場合がありますが使用しないため削除してしまっても問題ありません．
![タスクトレイ](/images/blog/20251029/glaze_tray.png)
`config.yaml`を編集します．コンフィグファイルの上部から主要部分を解説していきます．
```yaml
general:
  # WMが起動したときに実行するコマンドの設定．スクリプト，アプリケーションの実行が出来ます．
  startup_commands: []
  # WMがシャットダウンする直前に実行するコマンドの設定．
  shutdown_commands: []
  # WMの設定がリロードされた後に実行するコマンドの設定．
  config_reload_commands: []
```
[]内に実行したいコマンドを指定することで任意のアプリケーションの起動や外部スクリプトの実行が可能です．場合によっては初期設定でzebarを起動するコマンドが記述されている場合があります．その場合は以後導入するyasbとコンフリクトする可能性があるため削除してください．また下記はコマンド実行の一例として，GlazeWM起動時にターミナルを開く設定です．
```yaml
general:
  startup_commands: ['shell-exec wt']
```
次にウィンドウタイリング時のギャップの設定になります．
```yaml
gaps:
  # モニターのDPIに合わせてギャップをスケーリングするかどうか。
  scale_with_dpi: true
  # 隣接するウィンドウ間のギャップ。
  inner_gap: '10px'
  # ウィンドウと画面端の間のギャップ。
  outer_gap:
    top: '10px'
    right: '20px'
    bottom: '20px'
    left: '20px'
```
　利用している環境，好みに合わせてサイズを調整することが出来ます．パラメータを適宜変更して実際に動作を確認したい場合，再度タスクトレイ>glazeWM>Reload　configを押下すること(もしくはalt+shift+r)で設定の再読み込みが可能です．\\
次にフォーカス中のウィンドウ，非フォーカス中のウィンドウに対する特殊効果の設定です．
```yaml
window_effects:
  # フォーカスされたウィンドウに適用する視覚効果
  focused_window:
    border: # ウィンドウを色付きの枠でハイライトします
      enabled: true
      color: '#8dbcff'
#=======中略========
     corner_style: # ウィンドウのフレームの角のスタイル変更
      enabled: true
      # 選択できる値: 'square', 'rounded', 'small_rounded'
      style: 'rounded'

    # ウィンドウの透明度を変更できます．
    transparency:
      enabled: true
      # '95%'や'0.95'のように、わずかに透明なウィンドウにできます
      # 完全に透明にしてしまうとフォーカスが出来なくなってしまうため注意
      opacity: '95%'
  
  # フォーカスされていないウィンドウに適用する視覚効果
  other_windows:
    border:
      enabled: true
      color: '#a1a1a1'
#======以下フォーカス時の設定項目と同様======
```
　ウィンドウの淵のスタイルや，透過といった効果を簡単に適用することが出来ます．ただし，opacityに関しては0%に設定してしまうとマウスをホバーしてもフォーカスが出来なくなってしまうため注意が必要です．\\
最後にキーバインドに関する項目を，私が頻繁に利用するものから抜粋してご紹介します．また，キーバインドの設定に関しては，bindingsの項目内のキーをカンマ区切りで指定することで複数割り当てることも可能です．
```yaml
keybindings:
  # 複数ウィンドウ表示時に，指定された方向にフォーカスを移動します．
  # マウスを操作することなくウィンドウの選択を切り替えられます．
  - commands: ['focus --direction left']
    bindings: ['alt+h', 'alt+left']
  - commands: ['focus --direction right']
    bindings: ['alt+l', 'alt+right']

  # 複数ウィンドウ表示時に，フォーカス中のウィンドウを移動します．
  - commands: ['move --direction left']
    bindings: ['alt+shift+h', 'alt+shift+left']
  - commands: ['move --direction right']
    bindings: ['alt+shift+l', 'alt+shift+right']

  # 複数ウィンドウ表示時，フォーカスされたウィンドウのサイズを調整できます．
  # (マウスカーソルでのリサイズも可能です)
  - commands: ['resize --width -2%']
    bindings: ['alt+u']
  - commands: ['resize --width +2%']
    bindings: ['alt+p']

  # 新規ウィンドウが出現する方向を↕と↔で切り替えできます．
  # 以後の節で導入するyasbではこの方向も視覚的に可視化できます．
  - commands: ['toggle-tiling-direction']
    bindings: ['alt+v']

  # フォーカスされたウィンドウをフローティングに変更します．
  # windows純正のウィンドウの挙動で操作可能になります．
  - commands: ['toggle-floating --centered']
    bindings: ['alt+shift+space']

  # フォーカスされたウィンドウをタイリングに変更します．
  # ウィンドウが自動でタイリングされない状態に陥った場合はこれで大体解決します．
  - commands: ['toggle-tiling']
    bindings: ['alt+t']

  # フォーカスされたウィンドウを最小化します．
  # win純正のalt+tabを併用するとキーボードのみで操作が完結しておすすめです．
  - commands: ['toggle-minimized']
    bindings: ['alt+m']

  # フォーカスされたウィンドウを終了します．
  - commands: ['close']
    bindings: ['alt+shift+q']

  
  # フォーカスされたウィンドウの親ワークスペースを指定された方向のモニターに移動します.
  # 複数モニタを使用している環境で非常に便利です．
  - commands: ['move-workspace --direction left']
    bindings: ['alt+shift+a']
  - commands: ['move-workspace --direction right']
    bindings: ['alt+shift+d']
  - commands: ['move-workspace --direction up']
    bindings: ['alt+shift+w'] # デフォルトと変更しているので注意(再描画と重複)
  - commands: ['move-workspace --direction down']
    bindings: ['alt+shift+s']

  # 下記の設定はwindows既定のターミナルを起動する設定です．
  # ヤッテル感を出したいときに使います．
  - commands: ['shell-exec wt']
    bindings: ['alt+enter']

# ワークスペース(仮想デスクトップのようなもの)を移動します．
  - commands: ['focus --workspace 1']
    bindings: ['alt+1']
  - commands: ['focus --workspace 2']
    bindings: ['alt+2']
                  ：
                  ：
                  ：
  
  # フォーカス中のウィンドウを任意のワークスペースに移動します．
  - commands: ['move --workspace 1', 'focus --workspace 1']
    bindings: ['alt+shift+1']
  - commands: ['move --workspace 2', 'focus --workspace 2']
    bindings: ['alt+shift+2']
                  ：
                  ：
                  ：
```
　以上が私が頻繁に利用するショートカット紹介とキーバインドの設定です．上記のショートカットをマッスルメモリーに叩き込めばキーボードから手を動かすことなくウィンドウ操作が完結します！(実際にはキーマップレジストリ，viaの設定によりさらに簡素化しているのはまたの機会に...)

## タブバー：Yasb Reborn
![yasbgit](/images/blog/20251029/yasb_git.png)
　[Yasb](https://github.com/amnweb/yasb)はPython(psutil)で作成されたタブバーを追加するOSSです．Windows APIをラップすることで，CPUやRam使用率といったコンピュータ本体の情報をリアルタイムに表示できるだけでなく，有志によって作成された外部アプリケーションと連携したウィジェットが50種類以上用意されているのが特徴となっています．また，スタイリングに関しても，コミュニティで作成されたテーマを簡単に利用することや，CSSを自身で記述して独自のスタイルを適用することも可能です．このため，ユーザーが作成したデザインを共有しあったり，dotfileについて議論が生まれる点が魅力の一つでもあります．


### 導入
　YasbはGlazeWMと同様，のインストールはwingetレジストリからの取得と，githubからダウンロードしたインストーラーを使用する二種類の方法で導入可能です．ここでは後者の方法を紹介します．\\
(wingetを利用する場合はターミナルで下記を実行)
```bash
winget install --id AmN.yasb
```
**注意点!!!**\\
yasbで使用されているテーマやウィジェットの多くは「[Nord fonts](https://www.nerdfonts.com/font-downloads)」が使用されています．事前に[Nord font Jetbrain Mono(推奨)](https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip)をダウンロードし，windowsにフォント導入を行ってくさい．\\
(フォントの設定はスタートメニューからフォントと検索し，「フォント設定-システム設定」を開きます．先ほどダウンロードしたフォントを解凍し，ドラッグ＆ドロップで導入可能です．)\\

yasbをインストールします．[リリースページ](https://github.com/amnweb/yasb/releases)にアクセスし，最新のインストーラを取得します．
![yasbインストーラの取得](/images/blog/20251029/installer_download_yasb.png)
その後，インストーラを実行し，指示に沿って導入を進めます．
![yasbのインストール](/images/blog/20251029/installer_check_yasb.png)
インストールが完了し，スタートメニューからyasbを実行すると，デスクトップ上部にタブバーが表示されます...!!

### テーマの変更
次に配布されているテーマの利用方法を紹介します．GlazeWM同様，デスクトップ右下のタスクトレイからアイコンを右クリックすると各種メニューにアクセスできます．
![yasbタスクトレイ](/images/blog/20251029/yasb_tray.png)
「Get Themes」をクリックするとユーザーが作成したテーマを簡単にインストールすることが出来ます．また，テーマ一覧は[こちら](https://github.com/amnweb/yasb-themes)からも閲覧可能です．ここでは後述するconfig.yamlやstyle.cssを独自にカスタマイズしたものが公開されており，コミット履歴からもわかる通り，かなりの頻度でテーマが公開されています．
![テーマのプレビュー](/images/blog/20251029/theme_prev.png)
テーマ選択ウィンドウから，任意のテーマのinstallボタンを押下して，yasbをリロードすることで，テーマを利用できます．お好きなテーマをお選び下さい．
### コンフィグ：ウィジェットのカスタマイズ
ここからは既存のテーマをもとに新規ウィジェットの追加，オリジナルスタイルの方法について簡単に紹介します．タスクトレイ > yasb > open configの順にコンフィグファイルへアクセスします(もしくは`C:\Users\[yourName]\.config\yasb`を直接開きます．)
![yasbパス](/images/blog/20251029/yasb_path.png)
yasbのコンフィグは`config.yaml`と`style.css`の2ファイルで構成されています．前者は各ウィジェットの配置，表示形式等の変更を行うもの．後者はタブバーそのもののスタイルから各ウィジェットのフォントや配置，形状やアイコンを管理するファイルになっています．\\
また，利用可能なウィジェットとその利用方法，スタイルサンプルを公式[readme](https://github.com/amnweb/yasb?tab=readme-ov-file)から閲覧することが出来ます．今回は一例として，ウィジェット一覧の中から「[Note wiget](https://github.com/amnweb/yasb/wiki/(Widget)-Notes)」をタブバーの中央に配置してみようと思います．
![yasbウィジェット一覧](/images/blog/20251029/yasb_wigetlist.png)
#### ウィジェット追加1.configへの加筆
ウィジェットの説明ページの最初のセクションには変更可能なオプションとその効果に関する説明が記載されています．Example Configurationセクションに記載されているコードブロックからコードをコピーします．\\
`config.yaml`を開きます．下にスクロールしていくとwigetブロックがあります．このブロックでは先ほど選んだテーマで使用されているウィジェットのコンフィグが定義されています．インデントに注意してnoteウィジェットの定義を加筆してください．
![ウィジェットの定義](/images/blog/20251029/yasb_config1.png)
次に先ほど定義したウィジェットの配置位置を決めます．barsブロックは以下のwigetsブロックでウィジェットを呼び出します．ブロック内のcenter等がタブバー内での配置位置に対応しており，上に定義したものから順に左詰めで配置されますのでお好みの位置に配置してください．
![ウィジェットの配置](/images/blog/20251029/yasb_config2.png)
#### ウィジェット追加2.style.cssの加筆
追加したウィジェットにスタイルを当てます．先ほどのWIKIからExample Styleをコピーしてください．最下部までスクロールし，コピーしたものを張り付けて保存すればスタイルの適用も完了です．ここまで完了したらタスクパレット>yasb> Reload Yasbを選択してコンフィグを再読み込みしましょう．
![yasb終了](/images/blog/20251029/yasb_fin.png)
無事に新規ウィジェットが追加されました...!
### 独自テーマの作成
今回の内容では既存のテーマやウィジェットをそのまま使用する方法を紹介しましたが，実際には使用するアイコン，配色，表示形式もすべて自作することが出来ます．下記は私が使用しているスタイルの配色例です．
```css
:root {
    --miku-black: #252729;
    --miku-gray: #bec8d1;
    --miku-blue: #86cecb;
    --miku-green: #22949a;
    --miku-pink: #e12885;
}
```
これまでのスクリーンショットでお気づきかと思いますが そうですミクさんです...!\\
自分だけの推しがいる環境をRiceしてみてください//

# おわりに
ここまでたどりついてくれた方は大変お疲れさまでした．需要がありそうであればターミナルの設定なんかについても備忘録を残そうと思ってます．また，mdパーサーが不完全な状態でこれを書いているので時期によっては読みにくかったんじゃないかと思います(早急に改善します...)気分でその時はまってる技術について好き勝手書いていくのでよければ覗いてみてください．ありがとうございましたm(_ _)m