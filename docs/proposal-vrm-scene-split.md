# createVrmScene 分割 設計提案

`src/components/vrm/createVrmScene.ts`(491行)の分割に関する設計提案。
この文書は**提案のみ**であり、実装コミットは含まない(ユーザー決定:「提案止まりで構いません」)。
最終判断(実施 / 見送り)の材料として §6 に現状維持側の評価も併記する。

前提となる仕様の正は `DESIGN.md` §7・§7.5・§7.7 と `docs/rearchitecture.md`。
本提案はそれらの挙動を一切変えないことを絶対条件とする(挙動変更ゼロ)。

## 1. 現状の問題

対象は単一の `async function createVrmScene()`(L94-491)。レンダラー初期化・カメラ
フレーミング・3モーションモード(loop / dock / pulse)・プロシージャル待機・まばたき・
視線追従・可視性制御・disposeが1関数のクロージャ内に同居している。

### (a) モード固有stateが素のローカル変数に平置きされている

L205-213 で `mixer`(全モード共有)に続き、モード固有stateが**8個**のローカル変数として
宣言されている。

| 行 | 変数 | 型 | 使うモード |
|---|---|---|---|
| L206 | `dockLoopAction` | `AnimationAction \| undefined` | dock |
| L207 | `dockAction` | `AnimationAction \| undefined` | dock |
| L208 | `getDocked` | `(() => boolean) \| undefined` | dock |
| L209 | `isDocked` | `boolean`(= false) | dock |
| L210 | `pulseIdleAction` | `AnimationAction \| undefined` | pulse |
| L211 | `pulseAction` | `AnimationAction \| undefined` | pulse |
| L212 | `getTriggerToken` | `(() => number) \| undefined` | pulse |
| L213 | `lastTriggerToken` | `number \| undefined` | pulse |

厳密には8個のうち7個がnullable、`isDocked`(L209)のみboolフラグである。どのモードが
どの変数を占有するかは型で表現されておらず、L221-274 の初期化ブロックと L387-431 の
`tick()` 分岐を突き合わせて初めて追える。dockの4変数とpulseの4変数は互いに常に一方だけが
非undefinedになるという不変条件を持つが、それを保証する仕組みは無く、規律で守っている。

### (b) `tick()` が4分岐のif連鎖になっている

`tick()`(L381-434)のモード分岐は L387-431 で、判定を変数の非undefined性に依存させた
4分岐if-elseになっている。

| 行 | 条件 | 実体 |
|---|---|---|
| L387 | `pulseIdleAction && pulseAction && getTriggerToken` | pulse |
| L401 | `dockLoopAction && dockAction && getDocked` | dock |
| L425 | `mixer` | loop |
| L429 | `else` | プロシージャル待機 |

新しいモードを1つ足すたびに、(1) `VrmMotion` 型union(L25-49)、(2) L205-213 のローカル
変数群、(3) L221-274 の初期化、(4) この `tick()` 分岐、の4箇所へ同時に加筆する必要がある。
分岐の順序自体も暗黙の優先順位(pulse → dock → loop → fallback)を持ち、判定条件が
「変数がたまたま埋まっているか」なので、初期化漏れが型エラーではなく静かな分岐ミスとして現れる。

### (c) `composeOnAnimatedPose` の正解値がモード依存で、過去に実バグを生んだ

`updatePointerFollow(delta, composeOnAnimatedPose)`(定義 L331-353)は、マウス追従の頭部
回転を「アニメーション由来の頭姿勢に乗算合成する(`true`)」か「レスト姿勢基準で毎フレーム
上書きする(`false`)」かを引数で切り替える。この正解値はモードごとに異なる。

| モード | 呼び出し | 値 | 根拠 |
|---|---|---|---|
| pulse | L399 | `false` | L397-398 のコメント |
| dock | L423 | `false` | L418-422 のコメント |
| loop | L427 | `true` | — |
| 待機 | L377(`updateIdleMotion`内) | `false` | — |

`true` を誤って選ぶと「頭部回転暴走」の実バグになる。これはコメントL418-422に痕跡が残る:
dockの `v-sign.vrma` のようにクリップにheadボーンのトラックが無い場合、`mixer.update()` が
headBoneに触れないため、`composeOnAnimatedPose=true` の `headBone.quaternion.multiply()`
(L348)が前フレームの結果に毎フレーム積み重なり、頭が際限なく回転し続ける
(DESIGN.md §7.7 L354-360 に「Aboutにドックした状態で発生していた」と記録あり)。
pulse側のL397-398コメントも「dockモードと同じ理由」で `false` 固定にしている旨を明記している。

問題は、この正解値が**モードではなく「現在アクティブなクリップがheadボーンを駆動するか」に
依存する性質**でありながら、呼び出し側(`tick()`の各分岐)が引数リテラルで持っている点である。
モード追加やクリップ差し替えのたびに、呼び出し側が正解値を人手で選び直す必要があり、
間違えても型では防げない。現状これは「表示されるか」しか見ない自動テスト
(D1 影響範囲)を素通りし、目視でしか検出できない。

## 2. 分割後のファイル構成案

`createVrmScene.ts` をオーケストレータとして残し、責務ごとに3ファイルを新設する
(D1 改善案のファイル構成に準拠)。すべて `src/components/vrm/` 配下。

```
createVrmScene.ts        オーケストレータ。公開APIを保持(不変)      ~160行
camera-framing.ts        ボーン実座標からのバストアップ画角計算       ~55行
procedural-idle.ts       共有アンビエント層(まばたき+視線)+待機   ~130行
motion-controllers.ts    loop/dock/pulse の3コントローラ + 生成      ~180行
```

### 各ファイルの責務

**`createVrmScene.ts`(オーケストレータ)**
現行 L94-491 のうち、three.js資源の生成と寿命管理だけを残す。
- レンダラー / シーン / カメラ / ライト初期化(L101-116)
- ローダー登録・モデルロード・VRMExtension取り出し(L118-138)
- `VRMUtils` クリーンアップ・ボーン取得・立ちポーズ・restQuats・表情初期化
  (L132-164, L201-203)。※ボーン取得とrestQuatsはコントローラ/待機層への
  入力なのでここで一度だけ作る
- `frameCamera()`(camera-framing.ts)の呼び出しと `lookAtTarget` 配置(L166-199)
- コントローラ生成の委譲(下記)とrAFループ(汎用化した `tick`)
- `ResizeObserver` / `IntersectionObserver` / `startLoop` / `stopLoop` / 初期1フレーム描画 /
  `pointermove` 登録 / `dispose`(L276-490)

汎用化後の `tick()` は4分岐が消え、以下の3行の一様な形になる:

```ts
controller.update(delta)
ambient.updatePointerFollow(delta, controller.composeOnAnimatedPose)
ambient.updateBlink(delta)
vrm.update(delta); renderer.render(scene, camera)
```

**`camera-framing.ts`**
`frameCamera(camera, vrm, cameraFraming): { focusHeight: number; cameraDistance: number }`。
生ボーン座標からバストアップ画角を組み、ボーンが無いモデルはバウンディングボックスへ退避
(現行 L166-199)。定数 `DEFAULT_HEAD_TOP_MARGIN` / `DEFAULT_HIPS_BOTTOM_MARGIN`(L79-80)を
同居させる。副作用は `camera.position` / `camera.lookAt` の設定のみで、他モジュールに依存しない
純粋な幾何計算。

**`procedural-idle.ts`(共有アンビエント層 + 待機コントローラ)**
D1が「まばたき+視線+待機」と括った3要素を持つ。2つの成果物を公開する。
- `createAmbientLayer({ vrm, headBone, restQuats, lookAtTarget, focusHeight })`:
  全モードで毎フレーム走る共有層。`updatePointerFollow(delta, compose)`(L331-353)・
  `updateBlink(delta)`(L311-329)・`handlePointerMove(event)`(L301-304)を返す。
  pointer / smoothedPointer / blinkPhase / blinkCooldown の内部stateを閉じ込める。
  関連定数(L65-78 の呼吸・揺れを除くまばたき・視線系)を同居。
- `createProceduralIdleController(deps)`: motionが無い/クリップ読込失敗時の
  フォールバックとなる `MotionController`。`update()` で呼吸・揺れ・腰の上下
  (`updateIdleMotion` L355-379 の本体)を走らせる。呼吸・揺れ定数(L65-69)はここ。

> 補足: 「共有アンビエント層(まばたき+視線)」は全モード共通で走り、
> 「待機の体モーション(呼吸・揺れ)」はフォールバック時のみ走る。両者は現行でも別物
> (前者は `tick` の全分岐で呼ばれ、後者は `else` 分岐L430の `updateIdleMotion` 内だけ)。
> 同一ファイルに置くのは「プロシージャルに姿勢を作る」責務でまとめられるため。

**`motion-controllers.ts`**
`createMotionController(motion, deps): Promise<MotionController | undefined>` ファクトリと、
loop / dock / pulse の3コントローラ実装、共通 `loadClip(url)`(L215-219、`loader`+`vrm` に
依存するためここ)を持つ。crossFade定数 `DOCK_CROSSFADE_SEC` / `PULSE_CROSSFADE_SEC` と
`PULSE_TIME_SCALE`(L85-88)を同居させる。**`PULSE_TIME_SCALE=2` は `TechStackShowcase.tsx` の
`CARD_ENTER_DELAY_MS=750` と連動する値(Behaviors To Preserve #10)であり、L87-88の連動を
説明するコメントも定数と一緒に移す。**

### 依存方向

```
callers (VrmCanvas / FloatingAvatar / VrmTechStackCanvas)
        │  import { createVrmScene, VrmSceneHandle } from "./createVrmScene"
        ▼
createVrmScene.ts ──▶ camera-framing.ts
        │        └──▶ procedural-idle.ts   (ambient層 + 待機コントローラ)
        └───────────▶ motion-controllers.ts (loop/dock/pulse)
```

- フォールバック判定(loop/dock/pulse生成失敗 → 待機)は**オーケストレータが持つ**:
  `const controller = (await createMotionController(motion, deps)) ?? createProceduralIdleController(deps)`。
  これにより `motion-controllers.ts` は `procedural-idle.ts` に依存しない(循環回避)。
- `MotionController` インターフェースは `motion-controllers.ts`(または小さな内部 `types.ts`)に
  置き、`createVrmScene.ts` と `procedural-idle.ts` の双方が参照する。

### 公開APIは不変(絶対条件)

呼び出し側3件(`VrmCanvas.tsx` / `FloatingAvatar.tsx` / `VrmTechStackCanvas.tsx`)は
いずれも `from "./createVrmScene"` で `createVrmScene` と `VrmSceneHandle` をimportし、
`VrmMotion` の形を構造的に構築している。以下は**すべて `createVrmScene.ts` から従来通り
export され、シグネチャ・型構造が一切変わらない**こと:

- `createVrmScene(options: VrmSceneOptions): Promise<VrmSceneHandle>`(L94-100)
- `VrmMotion`(L25-49)/ `VrmSceneOptions`(L51-59)/ `VrmSceneHandle`(L61-63)/
  `VrmCameraFraming`(L18-23)

内部型に移設する場合も re-export で従来のimportパスを保つ。呼び出し側4ファイルへの変更は
ゼロが条件。

## 3. MotionController インターフェース設計

### インターフェース

```ts
interface MotionController {
  /** マウス追従の頭部回転を、mixerが作った頭姿勢へ乗算合成する(true)か、
   *  レスト基準で毎フレーム上書きする(false)か。§1(c)の「頭部回転暴走」を
   *  呼び出し側が誤設定できないよう、正解値をコントローラ自身が持つ。 */
  readonly composeOnAnimatedPose: boolean
  /** 毎フレーム。モード固有の状態遷移(トリガー / ドック判定 / crossFade)と
   *  mixer.update(delta) を行う。共有アンビエント層(視線・まばたき)は呼ばない。 */
  update(delta: number): void
  /** mixerのstopAllAction/uncacheRootと、イベントリスナ解除。
   *  ★ deepDispose(vrm.scene) より前に呼ぶ契約(§5参照)。 */
  dispose(): void
}
```

**D1のスケッチからの意図的な差分**: D1 改善案は `init(mixer)` / `tick(delta)` を挙げていたが、
本提案は「ファクトリがmixerを生成・所有し、`update(delta)` を公開する」形に精緻化する。
理由: 現行では `mixer` の生成自体が「クリップが読めたか」に条件付き(L228-229, L242-243,
L262)で、モードによってmixerの有無や `finished` リスナ(L253-257)の要否が違う。mixerを
コントローラの外で作って `init` で渡すと、この条件分岐がオーケストレータ側に残り分割の意味が
薄れる。mixerをコントローラの内部資源にすれば、生成・crossFade・破棄が1箇所に閉じる。

### `composeOnAnimatedPose` の正解値をコントローラが持つ

各コントローラが自身の正解値を `readonly` フィールドで宣言する。呼び出し側(オーケストレータの
`tick`)は `controller.composeOnAnimatedPose` を読むだけで、リテラルを選ばない。

| コントローラ | `composeOnAnimatedPose` | 対応する現行 |
|---|---|---|
| `LoopController` | `true` | L427 |
| `DockController` | `false` | L423 |
| `PulseController` | `false` | L399 |
| `ProceduralIdleController` | `false` | L377 |

これで §1(c) の footgun が構造的に消える。より本質的には、正解値は「アクティブクリップが
headボーンを駆動するか」の帰結なので、将来クリップにheadトラックが有る/無いを問わず安全側
(`false`=レスト基準上書き)を既定とし、`true` は「クリップのhead演技を活かしたい」と明示的に
判断したモード(現状はloopのみ)だけが選ぶ、という規約を各コントローラのコメントに残す。

### 各コントローラが持つべき責務(現行の所在との対応)

**`LoopController`(現行 L259-266, L425-428)**
- 生成時: `loadClip(animationUrl)` → mixer生成 → `clipAction(clip).play()`(既定LoopRepeat)
- `update(delta)`: `mixer.update(delta)` のみ
- `composeOnAnimatedPose = true`

**`DockController`(現行 L223-236, L401-424)**
- 生成時: loop/dockクリップを `Promise.all` で読み、両方揃った時のみmixer生成。
  `dockLoopAction.play()`、`dockAction` は `setLoop(LoopOnce,1)` + `clampWhenFinished=true`。
  `getDocked` を保持。両クリップが揃わなければファクトリは `undefined` を返す(→待機へ)
- `update(delta)`: `getDocked()` と内部 `isDocked` を比較し、変化時に `crossFadeTo`
  (ドック方向は `dockAction.reset().play()` → `dockLoopAction.crossFadeTo(dockAction,...)`、
  解除方向は逆。L409-415)。その後 `mixer.update(delta)`
- `isDocked` フラグ・`DOCK_CROSSFADE_SEC` はコントローラ内に閉じる
- `composeOnAnimatedPose = false`

**`PulseController`(現行 L237-258, L387-400)**
- 生成時: idle/pulseクリップを `Promise.all` で読み、両方揃った時のみmixer生成。
  `pulseIdleAction.play()`、`pulseAction` は `setLoop(LoopOnce,1)` + `clampWhenFinished=true` +
  `timeScale=PULSE_TIME_SCALE`。`getTriggerToken` 保持、`lastTriggerToken` 初期化。
  **mixerの `finished` イベントリスナ(L253-257)をここで登録**し、`pulseAction` 完了時に
  `pulseIdleAction` へ自動crossFade(dockと違い呼び出し側が「戻す」タイミングを与えなくてよい)
- `update(delta)`: `getTriggerToken()` を前回値と比較。変化時は前の演技を打ち切って
  `pulseAction.reset().play()` → `pulseIdleAction.crossFadeTo(pulseAction,...)`(L393-394)。
  その後 `mixer.update(delta)`
- **トリガーカウンタ**(真偽値でなくカウンタなのは連続トリガー取りこぼし防止。L44-48 の型
  コメント参照)・`lastTriggerToken`・`PULSE_CROSSFADE_SEC` はコントローラ内に閉じる
- `dispose()`: `finished` リスナを外してから `mixer.stopAllAction()` / `uncacheRoot`
- `composeOnAnimatedPose = false`

**`ProceduralIdleController`(procedural-idle.ts、現行 L355-379 + L429-431)**
- mixerを持たない。`update(delta)` で呼吸(chest)・揺れ(spine)・腰の上下(hips)を
  レスト基準で組む
- `composeOnAnimatedPose = false`、`dispose()` は no-op

### mixer所有・イベント・crossFadeの所在(まとめ)

| 関心事 | 現行の所在 | 分割後の所在 |
|---|---|---|
| mixer生成/破棄 | オーケストレータ(条件付き)L205,228,242,262,482 | 各コントローラ(内部資源) |
| `finished`(pulse自動idle復帰) | L253-257 | `PulseController` |
| トリガーカウンタ | L212-213,388-395 | `PulseController` |
| ドック判定ヒステリシス | 呼び出し側(`avatarTravel.ts`)+ L402-416 | 判定は呼び出し側のまま / crossFadeは `DockController` |
| crossFade制御 | L411-414(dock), L256(pulse), L394(pulse) | 各コントローラ |
| `composeOnAnimatedPose` 正解値 | `tick` のリテラル(L399,423,427,377) | 各コントローラの `readonly` フィールド |

## 4. 移行手順(1モード=1コミット)

各ステップは単独で挙動不変・単独でビルド/型検査を通し、他モードは移行済みステップまで
インラインのまま残す。これにより1コミットずつ切り戻せる。**動きの正しさは目視でしか
確認できない(D1)ため、各ステップにスクリーンショット/ボーン値の検証を必ず付ける。**

- **Step 0(準備・純構造)**: `camera-framing.ts` を抽出(幾何計算のみ、挙動リスク最小)。
  `procedural-idle.ts` の共有アンビエント層(`updatePointerFollow` / `updateBlink` /
  `handlePointerMove`)と `ProceduralIdleController` を抽出し、`tick` の共有呼び出しと
  `else`(待機)分岐だけ差し替える。loop/dock/pulseの3分岐はインラインのまま。
  検証: 4経路すべて現行と同一(特にreduced-motionの静的1フレーム)。
- **Step 1(loop)**: `MotionController` I/Fと `LoopController` を導入し、`else if (mixer)`
  分岐(L425-428)を置換。検証: Hero(`VrmCanvas`、非showcase経路)。
- **Step 2(dock)**: `DockController` を導入し dock分岐(L401-424)を置換。
  検証: Hero↔About移動(`FloatingAvatar`)。特に §1(c) の頭部回転暴走の非再現。
- **Step 3(pulse)**: `PulseController`(`finished` リスナ含む)を導入し pulse分岐
  (L387-400)を置換。検証: TechStack showcase(`VrmTechStackCanvas`)。
- **Step 4(掃除)**: 死んだ L205-213 のローカル群を撤去し、`tick` を §2 の3行形に確定。
  フォールバック判定を `?? createProceduralIdleController(deps)` に集約。検証: 全経路 再確認。

各ステップ後に共通で `npm run lint` → `npm run typecheck` → `npm run build`(SSGルート区分
○/●/ƒ が Phase 0 記録と一致)。

### 視覚・状態検証(具体的な撮影/計測ポイント)

Playwrightで自前 `npm run build && npm run start`(自分で起動したプロセスのみ終了)、
ビューポートは モバイル390×844 / デスクトップ1280×800。**動く瞬間のピクセル差分は
タイミング依存でflakeするため、回帰ガードは決定的な静止状態に置く(以下★)。** 演技途中の
撮影は補助的な目視確認に留める。

1. **Heroドック→Aboutドック遷移**:
   - 補助(目視): `#about` セクションへ progress≈0.5 までスクロールし、アバターが
     translate+scaleで移動中のフレームを撮影(位置・スケールの連続性を目視)。
   - ★ **決定的ガード**: Aboutまでドックし切って**数秒静止**させた状態で、
     (i) `v-sign.vrma` の `clampWhenFinished` による最終フレーム静止をスクリーンショット、
     (ii) **headボーンのquaternionを注入JSで読み、数秒間安定している(発散しない)ことを
     アサート**。これが §1(c) の暴走バグに対する唯一の確実なガード(ピクセル差分では
     暴走の初期を捉えられない)。
2. **TechStackワンショットの演技ピーク**:
   - 補助(目視): カテゴリ境界を跨いでトリガーし、`CARD_ENTER_DELAY_MS`(750ms、
     `timeScale=2` 下の山場)付近を撮影(「持ち上げ」ピークとカード出現の同期を目視)。
   - ★ **決定的ガード**: トリガー後に演技が完了→**idleへ自動復帰し切った静止状態**を
     撮影(`finished` イベント経路が生きていることの確認)。連続トリガー後に
     取りこぼしなくidleへ戻ることも確認。
3. **reduced-motionフォールバック**:
   - ★ CDPで `prefers-reduced-motion: reduce` をエミュレートし、Hero / About / TechStack の
     **静的1フレーム**(静的グリッド+写真アイコン、VRMは1フレーム描画)を撮影。
     クリップ(.vrma)のロードが発生しないこと(下記 §5 のゲート)をネットワークログで確認。

`before`(分割前 `HEAD`)/`after`(各ステップ)で同条件撮影し、★の決定的状態を比較する。

## 5. リスクと非目標

### 挙動変更ゼロが条件

本提案の唯一の合格条件は「機能・見た目・動きが分割前と完全一致」であること。D1が
「純粋な構造分割でも初期化順序・クロージャ共有の壊れ方が静かに起きる。変更リスク: 高」と
評価している通り、以下は型検査を素通りしうる静かな回帰である。各Stepの検証(§4)で潰す。

- **reduced-motionゲートの逸脱**: 現行はクリップ読込一式が `if (!reducedMotion && motion)`
  (L221)の内側にあり、reduced-motion時はmixerもコントローラも生成せず `.vrma` を1つも
  読まない(静的1フレーム L462-465 のみ、`startLoop` も L437 で早期return)。ファクトリ化後も
  **コントローラ生成(=クリップ読込)を必ずこのゲートの内側に保つ**。ゲート外で生成すると
  reduced-motionで無駄な23MB級の読込が走り、静的表示という仕様(Behaviors #9)を破る。
- **init/dispose順序の逆転**: 現行disposeは `mixer.stopAllAction/uncacheRoot`(L482-483)→
  `scene.remove`(L485)→ `VRMUtils.deepDispose(vrm.scene)`(L486)の順。コントローラが
  mixerと `finished` リスナを持つ後、**`controller.dispose()` は必ず `deepDispose` より前に
  呼ぶ**(§3のI/F契約)。逆順だと破棄済みシーングラフへmixerが触れて静かに壊れる。
- **クロージャ共有の分断**: `restQuats` / `lookAtTarget` / `headBone` / `focusHeight` は
  現行クロージャで共有されている。分割後はコントローラ/アンビエント層へ**同一インスタンスを
  参照渡し**する(コピーしない)。restの基準がずれると呼吸・揺れ・視線が微妙に狂う。
- **初期化順序**: カメラフレーミング(L166-199)→ `lookAtTarget` 配置(L194-196)→
  表情初期化(L203)→ コントローラ生成、の順序依存を保つ。

### 非目標(やらないこと)

- **React Three Fiber化**、宣言的シーングラフへの移行はしない(命令的three.jsのまま)。
- 状態管理ライブラリの導入をしない。
- 新しいnpm依存を追加しない。
- モーションの意匠・タイミング・定数値(`PULSE_TIME_SCALE` 等)を変えない。定数は所在を
  移すだけで値は不変。
- 公開API(`createVrmScene` シグネチャ / `VrmMotion` / `VrmSceneHandle` /
  `VrmSceneOptions` / `VrmCameraFraming`)を変えない。呼び出し側4ファイルに手を入れない。
- `avatar.vrm` 本体・`.vrma` アセットに触れない(D10 スコープ外)。

## 6. 見送り判断の材料

現状維持も合理的な選択肢である。実施 / 見送りの判断材料を公平に併記する。

### 分割しない場合に将来発生するコスト

- **モード追加時の4点同時編集**: 新モーションモードを足すたび §1(b) の4箇所(型union /
  ローカル変数群 / 初期化 / `tick`分岐)を lockstep で編集する必要が続く。編集箇所が
  離れているほど片側漏れが起きやすい。
- **`composeOnAnimatedPose` footgunの残存**: §1(c)。正解値を呼び出し側リテラルが持つ限り、
  新モード追加・クリップ差し替えのたびに人手で選び直し、間違えても型で防げず目視でしか
  検出できない。頭部回転暴走は一度実際に起きたバグである。
- **テストの弱さとの相乗**: 自動テストは「表示されるか」しか見ず(D1)、動きの正しさは
  目視のみ。神モジュールのまま規模が増えると、目視レビューの負荷とすり抜けリスクが上がる。

### 現状維持が合理的である理由

- **このファイルは滅多に変わらない**: リアーキテクチャ後、モーションモードは loop→dock→pulse と
  出揃っており、当面の新モード追加予定は無い。分割の便益(モード追加の摩擦低減)は
  将来モードが実際に来て初めて実現する。
- **footgunは既に濃いコメントで封じられている**: L397-398 / L418-422 / DESIGN.md §7.7 に
  「なぜ `false` 固定か」が明記され、`PULSE_TIME_SCALE` の連動(Behaviors #10)も文書化済み。
  規律で守られている状態で、実バグとして表面化していない。
- **分割自体が高リスクで、検証が目視頼み**: §5 の静かな回帰(初期化順序・dispose順序・
  reduced-motionゲート・クロージャ共有)を、動きの正しさは目視でしか確認できない条件下で
  潰す作業になる。**リスクは分割を行う「今」支払い、便益は将来モードが来るまで発生しない**。
- 491行は単一責務の巨大クラスではなく、CSR分離された1つの副作用の塊(1シーンの生成～破棄)。
  自己完結し、外部への影響面は公開API4件に限られる。

### 推奨

新モーションモードの追加が具体化した時点(または頭部回転暴走系のバグが再発した時点)を
分割の起動条件とし、それまでは現状維持+本提案の凍結保存が妥当。着手する場合は §4 の
1モード=1コミット手順を、§4の★決定的ガードとセットで厳守すること。
