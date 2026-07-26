---
id: HeadFlickIME
title: 非接触型文字入力デバイス
thumbnail: /images/products/HeadFlickIME/thumb_HeadFlickIME.jpg
techStack:
  - Arduino
  - Processing
description: 頭部と瞼の動きだけで文字入力を可能にする，外部カメラ不要のウェアラブルデバイス．
screenshots:
  - /images/products/HeadFlickIME/prev_HeadFlickIME_1.png
  - /images/products/HeadFlickIME/prev_HeadFlickIME_2.png
  - /images/products/HeadFlickIME/prev_HeadFlickIME_3.png
urls:
  demo: https://youtu.be/X3LBFIodq7U
  github: https://github.com/yuzukq/HeadFlickIME
---

瞼の開閉動作と頭部の動作を組み合わせて文字入力を実現するデバイスです．Arduinoを用いた電子工作において，フォトリフレクタと加速度センサを固定したハードウェアを3Dプリンタで設計したことで，外部カメラやソフトウェア画像処理を利用することなく簡易的なアイトラッキングとフェイシャルトラッキングを実現しました．また，入力補助を兼ねるインタフェースとしてはProcessingによるフリック入力盤をリアルタイムに描画することで，良好なユーザービリティのUI/UXを実現しました．また，この文字入力デバイスは，福祉的な領域での活用だけでなく，参考画像にて掲載したような3Dモデルをリアルタイムに操作する娯楽的な領域での活用も期待できます．

## 主な機能

- 外部カメラ不要のウェアラブル端末
- 頭部の動作のみでフリック入力を実現

## 工夫点・課題

- 既存のアイトラッキングデバイスが抱える高コストという課題を安価なマイコンとセンサの組み合わせで解消しました．
- 六軸加速度センサの特性であるドリフトを抑制するための地磁気とのセンサフュージョンの必要性など課題が明らかになりました．
