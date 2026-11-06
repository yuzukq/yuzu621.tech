# public/models/

ここに `avatar.vrm` を置くと、プロフィール(`/profile`)のHero・About・Tech Stackに
VRMモデルが表示されます。

- ファイル名は必ず `avatar.vrm` にしてください(`src/components/vrm/` 配下の各キャンバスが
  `/models/avatar.vrm` を固定パスで読み込みます)。
- ファイルがまだ無い場合や読み込みに失敗した場合は、ミクティールのグラデーション球
  (プレースホルダ)が代わりに表示されます。エラーにはならないので、まずはこの
  READMEの状態のままデプロイしても問題ありません。
- 再配布ライセンスの都合上、サンプル・仮モデルはこのリポジトリに同梱していません。
  各自が利用許諾を確認したVRMモデルを配置してください。

## avatar.vrm は最適化スクリプトを通してから配置する

書き出したままのVRMはテクスチャが 2048px の PNG で、20MB を超えることがあります。
キャンバスの表示サイズは最大でも 432px × DPR2 程度なので、配置する前に次のコマンドで
テクスチャを長辺 1024px に縮小し、同一画像の重複を除いてください。

```bash
npm run optimize:vrm -- <書き出したモデル.vrm> public/models/avatar.vrm
# PNG をパレット量子化してさらに小さくする場合(肌・髪のグラデーションに縞が出ないか目視で確認する)
npm run optimize:vrm -- <書き出したモデル.vrm> public/models/avatar.vrm --palette
```

- glTF の JSON 構造(`extensions.VRM` 内のインデックス参照を含む)は変えず、画像のバイト列だけを差し替えます。
- 入力ファイルは上書きしません(入力と出力に同じパスを指定するとエラーになります)。
- 書き出した後は `gltf-validator`(npm パッケージ。CLI ではなく `validateBytes()` を呼ぶ API)で
  error が 0 件であることを確認してください。未使用の bufferView による `UNUSED_OBJECT` の info は出ても問題ありません。

## VRMアニメーション(.vrma)

いずれも vrma-create スキルで生成した VRMA 1.0 ファイルです。無い/読めない場合は、
コード内蔵のプロシージャル待機モーション(呼吸・微揺れ・まばたき)に自動フォールバックします。

| ファイル | 用途 |
|---|---|
| `loop_verse.vrma` | Hero でループ再生する待機アニメーション |
| `v-sign.vrma` | About にアバターが着いたときに一度だけ再生するピースサイン(最終フレームで静止) |
| `tech-idle.vrma` | Tech Stack(lg 以上)でループ再生する待機モーション |
| `present-card.vrma` | Tech Stack でカテゴリが切り替わるたびに頭から再生する、カードを差し出す演技 |
