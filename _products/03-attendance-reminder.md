---
id: AttendanceReminder
title: AttendanceReminder-forCIT
thumbnail: /images/products/AttendanceReminder/thumb_attendanceReminder.png
techStack:
  - Google App Script
  - Discord webhook
description: 講義開始前にDiscordへ出席登録リンクを自動通知するツール．
screenshots:
  - /images/products/AttendanceReminder/prev_attendanceReminder_1.png
  - /images/products/AttendanceReminder/thumb_attendanceReminder.png
  - /images/products/AttendanceReminder/prev_attendanceReminder_2.png
urls:
  demo: https://github.com/yuzukq/AttendanceReminder-forCIT
  github: https://github.com/yuzukq/AttendanceReminder-forCIT
---

大学で運用されている出席管理システムへの登録を支援するツールです．私が所属している大学では，令和7年度から教室に掲示されたQRコードを個人所有のスマートフォンで読み取ることで，Webを経由して出席登録を行う仕組みが導入されました．この出席支援ツールは，ユーザーがGoogleスプレッドシート状の時間割表テンプレートにあらかじめ時間割を登録しておくことで，講義開講時間の30分前に自動で通知と各講義に応じた主出席登録用のリンクを任意のDiscordチャンネルに送信するツールとなっています．このツールにより，所属している大学のコミュニティ内全体で，各ユーザーの履修状況に応じた出席登録の失念防止に貢献しただけでなく，カメラを起動することなく，個人所有の端末やPCからの出席も可能になりました．また，このツールではドキュメントの整備も徹底し，非エンジニア領域の学生がこのツールを取り入れやすくするような工夫を施しました．

## 主な機能

- Discordからの容易な出席登録
- googleスプレッドシートと連携した自動通知
- google app scriptによるサーバレス通知の実現

## 工夫点・課題

- ユーザーのツール導入の敷居を下げるためにテンプレートとドキュメントの整備を行いました．
- 通知対象として，コミュニティで広く利用されているDiscordを選定したことで利便性が向上したと感じています
