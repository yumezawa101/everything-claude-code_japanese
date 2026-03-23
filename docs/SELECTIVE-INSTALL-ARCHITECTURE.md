# ECC 2.0 Selective Install 探索

## 目的

本ドキュメントは、3月11日のメガプランの selective-install 要件を具体的な ECC 2.0 探索設計に変換します。

目標は単に「インストール時にコピーするファイルを減らす」ことではありません。実際のターゲットは、以下を決定論的に回答できるインストールシステムです:

- 何が要求されたか
- 何が解決されたか
- 何がコピーまたは生成されたか
- どのターゲット固有の変換が適用されたか
- ECC が所有し、後から安全に削除または修復できるものは何か

これが ECC 1.x のインストールと ECC 2.0 コントロールプレーンの間に欠けているコントラクトです。

## 現在の実装済み基盤

最初の selective-install 基盤はリポジトリに既に存在します:

- `manifests/install-modules.json`
- `manifests/install-profiles.json`
- `schemas/install-modules.schema.json`
- `schemas/install-profiles.schema.json`
- `schemas/install-state.schema.json`
- `scripts/ci/validate-install-manifests.js`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install/request.js`
- `scripts/lib/install/runtime.js`
- `scripts/lib/install/apply.js`
- `scripts/lib/install-targets/`
- `scripts/lib/install-state.js`
- `scripts/lib/install-executor.js`
- `scripts/lib/install-lifecycle.js`
- `scripts/ecc.js`
- `scripts/install-apply.js`
- `scripts/install-plan.js`
- `scripts/list-installed.js`
- `scripts/doctor.js`

現在の機能:

- 機械可読のモジュールとプロファイルカタログ
- マニフェストエントリが実際のリポジトリパスを指していることの CI バリデーション
- 依存関係の展開とターゲットフィルタリング
- アダプター対応のオペレーション計画
- レガシーとマニフェストインストールモードの正規リクエスト正規化
- 正規化されたリクエストからプラン作成へのランタイムディスパッチ
- レガシーとマニフェストの両方のインストールが永続的な install-state を書き込む
- ミューテーション前のインストールプランの読み取り専用検査
- インストール、計画、ライフサイクルコマンドをルーティングする統一 `ecc` CLI
- `list-installed`、`doctor`、`repair`、`uninstall` によるライフサイクル検査とミューテーション

現在の制限:

- 一部のモジュールでターゲット固有のマージ/削除セマンティクスがまだスキャフォールドレベル
- レガシー `ecc-install` 互換性が依然として `install.sh` を指している
- `package.json` の公開サーフェスがまだ広い

## 現在のコードレビュー

現在のインストーラースタックは元の言語ファーストのシェルインストーラーよりもはるかに健全ですが、少数のファイルに依然として多すぎる責務が集中しています。

### 現在のランタイムパス

現在のランタイムフローは:

1. `install.sh`
   実際のパッケージルートを解決する薄いシェルラッパー
2. `scripts/install-apply.js`
   レガシーとマニフェストモード用のユーザー向けインストーラー CLI
3. `scripts/lib/install/request.js`
   CLI パースと正規リクエスト正規化
4. `scripts/lib/install/runtime.js`
   正規化されたリクエストからインストールプランへのランタイムディスパッチ
5. `scripts/lib/install-executor.js`
   引数の変換、レガシー互換性、オペレーションのマテリアライゼーション、ファイルシステムミューテーション、install-state の書き込み
6. `scripts/lib/install-manifests.js`
   モジュール/プロファイルカタログの読み込みと依存関係の展開
7. `scripts/lib/install-targets/`
   ターゲットルートと出力先パスのスキャフォールディング
8. `scripts/lib/install-state.js`
   スキーマに裏付けられた install-state の読み書き
9. `scripts/lib/install-lifecycle.js`
   保存されたオペレーションから派生した doctor/repair/uninstall の動作

これは selective-install 基盤を証明するのに十分ですが、インストーラーアーキテクチャが安定したと感じるには不十分です。

### 現在の強み

- インストール意図が `--profile` と `--modules` を通じて明示的になった
- リクエストパースとリクエスト正規化が CLI シェルから分離された
- ターゲットルート解決が既にアダプター化されている
- ライフサイクルコマンドが推測ではなく永続的な install-state を使用するようになった
- リポジトリには `ecc` と `install-apply.js` を通じた統一 Node エントリポイントが既にある

### 残存するカップリング

1. `install-executor.js` は以前より小さくなったが、依然として多すぎる計画とマテリアライゼーションレイヤーを同時に担っている。
   リクエスト境界は抽出されたが、レガシーリクエスト変換、マニフェストプラン展開、オペレーションマテリアライゼーションがまだ共存。
2. ターゲットアダプターがまだ薄すぎる。
   現在はルートの解決と出力先パスのスキャフォールディングが主。実際のインストールセマンティクスはエグゼキューターの分岐とパスヒューリスティクスに依然として存在。
3. プランナー/エグゼキューター境界が十分にクリーンでない。
   `install-manifests.js` がモジュールを解決するが、最終的なインストールオペレーションセットはエグゼキューター固有のロジックで部分的に構築される。
4. ライフサイクル動作が安定したモジュールセマンティクスよりも低レベルの記録されたオペレーションに依存。
   単純なファイルコピーには機能するが、マージ/生成/削除の動作では脆くなる。
5. 互換性モードがメインインストーラーランタイムに直接混在。
   レガシー言語インストールは、並列インストーラーアーキテクチャではなく、リクエストアダプターとして動作すべき。

## 提案されるモジュラーアーキテクチャ変更

次のアーキテクチャステップは、インストーラーを明示的なレイヤーに分離し、各レイヤーがファイルを即座にミューテートするのではなく安定したデータを返すようにすることです。

### 目標状態

望ましいインストールパイプラインは:

1. CLI サーフェス
2. リクエスト正規化
3. モジュール解決
4. ターゲット計画
5. オペレーション計画
6. 実行
7. install-state の永続化
8. 同じオペレーションコントラクト上に構築されたライフサイクルサービス

主なアイデアはシンプルです:

- マニフェストがコンテンツを記述
- アダプターがターゲット固有のランディングセマンティクスを記述
- プランナーが何が起こるべきかを記述
- エグゼキューターがそれらのプランを適用
- ライフサイクルコマンドが再発明せずに同じプラン/状態モデルを再利用

### 提案されるランタイムレイヤー

#### 1. CLI サーフェス

責務:

- ユーザー意図のみをパース
- install、plan、doctor、repair、uninstall へのルーティング
- ヒューマンまたは JSON 出力のレンダリング

所有すべきでないもの:

- レガシー言語変換
- ターゲット固有のインストールルール
- オペレーション構築

推奨ファイル:

```text
scripts/ecc.js
scripts/install-apply.js
scripts/install-plan.js
scripts/doctor.js
scripts/repair.js
scripts/uninstall.js
```

これらはエントリポイントとして残るが、ライブラリモジュールの薄いラッパーになる。

#### 2. リクエスト正規化器

責務:

- 生の CLI フラグを正規インストールリクエストに変換
- レガシー言語インストールを互換性リクエスト形状に変換
- 混在または曖昧な入力を早期に拒否

推奨される正規リクエスト:

```json
{
  "mode": "manifest",
  "target": "cursor",
  "profile": "developer",
  "modules": [],
  "legacyLanguages": [],
  "dryRun": false
}
```

または、互換性モードの場合:

```json
{
  "mode": "legacy-compat",
  "target": "claude",
  "profile": null,
  "modules": [],
  "legacyLanguages": ["typescript", "python"],
  "dryRun": false
}
```

これにより、パイプラインの残りの部分はリクエストが古い CLI 構文からか新しい構文からかを無視できる。

#### 3. モジュールリゾルバー

責務:

- マニフェストカタログの読み込み
- 依存関係の展開
- コンフリクトの拒否
- ターゲットごとの非サポートモジュールのフィルタリング
- 正規解決オブジェクトの返却

このレイヤーはピュアで読み取り専用であるべきです。

知るべきでないもの:

- 出力先ファイルシステムパス
- マージセマンティクス
- コピー戦略

現在の最も近いファイル:

- `scripts/lib/install-manifests.js`

推奨される分割:

```text
scripts/lib/install/catalog.js
scripts/lib/install/resolve-request.js
scripts/lib/install/resolve-modules.js
```

#### 4. ターゲットプランナー

責務:

- インストールターゲットアダプターの選択
- ターゲットルートの解決
- install-state パスの解決
- モジュールからターゲットへのマッピングルールの展開
- ターゲット対応のオペレーション意図の出力

ここにターゲット固有の意味が存在すべきです。

例:

- Claude は `~/.claude` 配下のネイティブ階層を保持する場合がある
- Cursor はバンドルされた `.cursor` ルート子要素をルールとは異なる方法で同期する場合がある
- 生成される設定はターゲットによってマージまたは置換セマンティクスが必要な場合がある

現在の最も近いファイル:

- `scripts/lib/install-targets/helpers.js`
- `scripts/lib/install-targets/registry.js`

推奨される進化:

```text
scripts/lib/install/targets/registry.js
scripts/lib/install/targets/claude-home.js
scripts/lib/install/targets/cursor-project.js
scripts/lib/install/targets/antigravity-project.js
```

各アダプターは最終的に `resolveRoot` 以上を公開すべきです。
ターゲットファミリーのパスと戦略マッピングを所有すべきです。

#### 5. オペレーションプランナー

責務:

- モジュール解決とアダプタールールを型付きオペレーショングラフに変換
- 以下のようなファーストクラスオペレーションを出力:
  - `copy-file`
  - `copy-tree`
  - `merge-json`
  - `render-template`
  - `remove`
- 所有権とバリデーションメタデータの付加

これが現在のインストーラーに欠けているアーキテクチャ上の継ぎ目です。

現在、オペレーションは部分的にスキャフォールドレベルで、部分的にエグゼキューター固有です。
ECC 2.0 はオペレーション計画をスタンドアロンフェーズにして:

- `plan` が実行の真のプレビューになる
- `doctor` が現在のファイルだけでなく意図された動作を検証できる
- `repair` が欠損した作業を安全に正確に再構築できる
- `uninstall` が管理されたオペレーションのみを逆転できる

#### 6. 実行エンジン

責務:

- 型付きオペレーショングラフの適用
- 上書きと所有権ルールの強制
- 書き込みの安全なステージング
- 最終的な適用済みオペレーション結果の収集

このレイヤーは*何を*するかを決定すべきではありません。
提供されたオペレーション種別を*どのように*安全に適用するかのみを決定すべきです。

現在の最も近いファイル:

- `scripts/lib/install-executor.js`

推奨されるリファクタリング:

```text
scripts/lib/install/executor/apply-plan.js
scripts/lib/install/executor/apply-copy.js
scripts/lib/install/executor/apply-merge-json.js
scripts/lib/install/executor/apply-remove.js
```

これにより、エグゼキューターロジックが1つの大きな分岐ランタイムから小さなオペレーションハンドラーのセットに変わる。

#### 7. Install-State ストア

責務:

- install-state のバリデーションと永続化
- 正規リクエスト、解決、適用されたオペレーションの記録
- ライフサイクルコマンドがインストールをリバースエンジニアリングせずに済むようサポート

現在の最も近いファイル:

- `scripts/lib/install-state.js`

このレイヤーは既に適切な形状に近い。主な残りの変更は、マージ/生成セマンティクスが実装された際により豊富なオペレーションメタデータを保存すること。

#### 8. ライフサイクルサービス

責務:

- `list-installed`: 状態のみを検査
- `doctor`: 望ましい/install-state ビューと現在のファイルシステムを比較
- `repair`: 状態からプランを再生成し、安全なオペレーションを再適用
- `uninstall`: ECC が所有する出力のみを削除

現在の最も近いファイル:

- `scripts/lib/install-lifecycle.js`

このレイヤーは最終的に、生の `copy-file` レコードだけでなく、オペレーション種別と所有権ポリシーに基づいて動作すべきです。

## 提案されるファイルレイアウト

クリーンなモジュラー最終状態は大まかに以下のようになるべきです:

```text
scripts/lib/install/
  catalog.js
  request.js
  resolve-modules.js
  plan-operations.js
  state-store.js
  targets/
    registry.js
    claude-home.js
    cursor-project.js
    antigravity-project.js
    codex-home.js
    opencode-home.js
  executor/
    apply-plan.js
    apply-copy.js
    apply-merge-json.js
    apply-render-template.js
    apply-remove.js
  lifecycle/
    discover.js
    doctor.js
    repair.js
    uninstall.js
```

これはパッケージング分割ではありません。
各レイヤーが1つの役割を持つよう、現在のリポジトリ内でのコード所有権の分割です。

## 現在のファイルからの移行マップ

最もリスクの低い移行パスは、書き直しではなく進化的です。

### 維持

- `install.sh` を公開互換性シムとして
- `scripts/ecc.js` を統一 CLI として
- `scripts/lib/install-state.js` を状態ストアの出発点として
- 現在のターゲットアダプター ID と状態の場所

### 抽出

- `scripts/lib/install-executor.js` からリクエストパースと互換性変換を抽出
- エグゼキューターブランチからターゲット対応のオペレーション計画をターゲットアダプターとプランナーモジュールに抽出
- 共有ライフサイクルモノリスからライフサイクル固有の分析をより小さなサービスに抽出

### 段階的に置き換え

- 広範なパスコピーヒューリスティクスを型付きオペレーションに
- スキャフォールドのみのアダプター計画をアダプターが所有するセマンティクスに
- レガシー言語インストールブランチを同じプランナー/エグゼキューターパイプラインへのレガシーリクエスト変換に

## 次に行うべきアーキテクチャ変更

目標が「十分に動く」ではなく ECC 2.0 であれば、次のモジュール化ステップは:

1. `install-executor.js` をリクエスト正規化、オペレーション計画、実行モジュールに分割
2. ターゲット固有の戦略決定をアダプターが所有する計画メソッドに移動
3. `repair` と `uninstall` を単純な `copy-file` レコードだけでなく型付きオペレーションハンドラーで動作させる
4. プランナーがパスヒューリスティクスに依存しなくなるよう、マニフェストにインストール戦略と所有権を教える
5. 内部モジュール境界が安定した後にのみ npm 公開サーフェスを狭める

## 現在のモデルでは不十分な理由

現在の ECC は依然として広範なペイロードコピーツールのように動作しています:

- `install.sh` は言語ファーストでターゲットブランチが重い
- ターゲットが部分的にディレクトリレイアウトに暗黙的
- アンインストール、修復、doctor は存在するが、まだ初期のライフサイクルコマンド
- リポジトリは前のインストールが実際に何を書き込んだかを証明できない
- `package.json` の公開サーフェスがまだ広い

これにより、メガプランで既に指摘された問題が生じます:

- ユーザーはハーネスやワークフローが必要とする以上のコンテンツを取得
- インストールが記録されないため、サポートとアップグレードが困難
- インストールロジックがシェルブランチに重複しているため、ターゲット動作がドリフト
- Codex や OpenCode のような将来のターゲットは、安定したインストールコントラクトを再利用するのではなく、追加の特殊ケースロジックが必要

## ECC 2.0 設計テーゼ

Selective install は以下のようにモデル化されるべきです:

1. 要求された意図を正規モジュールグラフに解決
2. そのグラフをターゲットアダプターを通じて変換
3. 決定論的なインストールオペレーションセットを実行
4. 永続的な情報源として install-state を書き込む

これは ECC 2.0 が1つではなく2つのコントラクトを必要とすることを意味します:

- コンテンツコントラクト
  どのモジュールが存在し、互いにどう依存するか
- ターゲットコントラクト
  それらのモジュールが Claude、Cursor、Antigravity、Codex、OpenCode の内部にどうランディングするか

現在のリポジトリには最初の半分のみが初期形態で存在していました。
現在のリポジトリには最初の完全な垂直スライスがありますが、完全なターゲット固有セマンティクスはまだありません。

## 設計制約

1. `everything-claude-code` を正規ソースリポジトリとして維持。
2. 移行中は既存の `install.sh` フローを保持。
3. 同じプランナーからホームスコープとプロジェクトスコープのターゲットをサポート。
4. 推測なしでアンインストール/修復/doctor を可能に。
5. ターゲットごとのコピーロジックがモジュール定義に逆流しないようにする。
6. 将来の Codex と OpenCode サポートを追加的にし、書き直しにしない。

## 正規アーティファクト

### 1. モジュールカタログ

モジュールカタログは正規のコンテンツグラフです。

既に実装されているフィールド:

- `id`
- `kind`
- `description`
- `paths`
- `targets`
- `dependencies`
- `defaultInstall`
- `cost`
- `stability`

ECC 2.0 にまだ必要なフィールド:

- `installStrategy`
  例: `copy`、`flatten-rules`、`generate`、`merge-config`
- `ownership`
  ECC がターゲットパスを完全に所有するか、その配下の生成ファイルのみを所有するか
- `pathMode`
  例: `preserve`、`flatten`、`target-template`
- `conflicts`
  1つのターゲット上で共存できないモジュールまたはパスファミリー
- `publish`
  モジュールがデフォルトでパッケージ化されるか、オプションか、インストール後に生成されるか

推奨される将来の形状:

```json
{
  "id": "hooks-runtime",
  "kind": "hooks",
  "paths": ["hooks", "scripts/hooks"],
  "targets": ["claude", "cursor", "opencode"],
  "dependencies": [],
  "installStrategy": "copy",
  "pathMode": "preserve",
  "ownership": "managed",
  "defaultInstall": true,
  "cost": "medium",
  "stability": "stable"
}
```

### 2. プロファイルカタログ

プロファイルは薄いままにします。

ターゲットロジックを複製するのではなく、ユーザー意図を表現すべきです。

既に実装されている例:

- `core`
- `developer`
- `security`
- `research`
- `full`

まだ必要なフィールド:

- `defaultTargets`
- `recommendedFor`
- `excludes`
- `requiresConfirmation`

これにより ECC 2.0 は以下のようなことを表現できます:

- `developer` は Claude と Cursor の推奨デフォルト
- `research` は狭いローカルインストールには重い場合がある
- `full` は許可されるがデフォルトではない

### 3. ターゲットアダプター

これが主な欠落レイヤーです。

モジュールグラフが知るべきでないもの:

- Claude ホームがどこにあるか
- Cursor がコンテンツをどうフラット化またはリマップするか
- どの設定ファイルがブラインドコピーではなくマージセマンティクスを必要とするか

それはターゲットアダプターに属します。

推奨インターフェース:

```ts
type InstallTargetAdapter = {
  id: string;
  kind: "home" | "project";
  supports(target: string): boolean;
  resolveRoot(input?: string): Promise<string>;
  planOperations(input: InstallOperationInput): Promise<InstallOperation[]>;
  validate?(input: InstallOperationInput): Promise<ValidationIssue[]>;
};
```

推奨される最初のアダプター:

1. `claude-home`
   `~/.claude/...` に書き込む
2. `cursor-project`
   `./.cursor/...` に書き込む
3. `antigravity-project`
   `./.agent/...` に書き込む
4. `codex-home`
   後日
5. `opencode-home`
   後日

これはセッションアダプター探索ドキュメントで既に提案されたのと同じパターンに一致します: 最初に正規コントラクト、次にハーネス固有のアダプター。

## インストール計画モデル

現在の `scripts/install-plan.js` CLI は、リポジトリが要求されたモジュールをフィルタリングされたモジュールセットに解決できることを証明しています。

ECC 2.0 には次のレイヤーが必要です: オペレーション計画。

推奨されるフェーズ:

1. 入力の正規化
   - `--target` のパース
   - `--profile` のパース
   - `--modules` のパース
   - オプションでレガシー言語引数の変換
2. モジュール解決
   - 依存関係の展開
   - コンフリクトの拒否
   - サポートされるターゲットによるフィルタリング
3. アダプター計画
   - ターゲットルートの解決
   - 正確なコピーまたは生成オペレーションの導出
   - 設定マージとターゲットリマップの識別
4. ドライラン出力
   - 選択されたモジュールの表示
   - スキップされたモジュールの表示
   - 正確なファイルオペレーションの表示
5. ミューテーション
   - オペレーションプランの実行
6. 状態の書き込み
   - 正常完了後にのみ install-state を永続化

推奨されるオペレーション形状:

```json
{
  "kind": "copy",
  "moduleId": "rules-core",
  "source": "rules/common/coding-style.md",
  "destination": "/Users/example/.claude/rules/common/coding-style.md",
  "ownership": "managed",
  "overwritePolicy": "replace"
}
```

その他のオペレーション種別:

- `copy`
- `copy-tree`
- `flatten-copy`
- `render-template`
- `merge-json`
- `merge-jsonc`
- `mkdir`
- `remove`

## Install-State コントラクト

Install-state は ECC 1.x に欠けている永続的なコントラクトです。

推奨されるパス規約:

- Claude ターゲット:
  `~/.claude/ecc/install-state.json`
- Cursor ターゲット:
  `./.cursor/ecc-install-state.json`
- Antigravity ターゲット:
  `./.agent/ecc-install-state.json`
- 将来の Codex ターゲット:
  `~/.codex/ecc-install-state.json`

推奨されるペイロード:

```json
{
  "schemaVersion": "ecc.install.v1",
  "installedAt": "2026-03-13T00:00:00Z",
  "lastValidatedAt": "2026-03-13T00:00:00Z",
  "target": {
    "id": "claude-home",
    "root": "/Users/example/.claude"
  },
  "request": {
    "profile": "developer",
    "modules": ["orchestration"],
    "legacyLanguages": ["typescript", "python"]
  },
  "resolution": {
    "selectedModules": [
      "rules-core",
      "agents-core",
      "commands-core",
      "hooks-runtime",
      "platform-configs",
      "workflow-quality",
      "framework-language",
      "database",
      "orchestration"
    ],
    "skippedModules": []
  },
  "source": {
    "repoVersion": "1.9.0",
    "repoCommit": "git-sha",
    "manifestVersion": 1
  },
  "operations": [
    {
      "kind": "copy",
      "moduleId": "rules-core",
      "destination": "/Users/example/.claude/rules/common/coding-style.md",
      "digest": "sha256:..."
    }
  ]
}
```

状態の要件:

- アンインストールが ECC 管理の出力のみを削除できる十分な詳細
- 修復が望ましい状態と実際にインストールされたファイルを比較できる十分な詳細
- doctor が推測ではなくドリフトを説明できる十分な詳細

## ライフサイクルコマンド

以下のコマンドが install-state のライフサイクルサーフェスです:

1. `ecc list-installed`
2. `ecc uninstall`
3. `ecc doctor`
4. `ecc repair`

現在の実装状況:

- `ecc list-installed` は `node scripts/list-installed.js` にルーティング
- `ecc uninstall` は `node scripts/uninstall.js` にルーティング
- `ecc doctor` は `node scripts/doctor.js` にルーティング
- `ecc repair` は `node scripts/repair.js` にルーティング
- レガシースクリプトエントリポイントは移行中も引き続き利用可能

### `list-installed`

責務:

- ターゲット id とルートを表示
- 要求されたプロファイル/モジュールを表示
- 解決されたモジュールを表示
- ソースバージョンとインストール日時を表示

### `uninstall`

責務:

- install-state を読み込む
- 状態に記録された ECC 管理の出力先のみを削除
- ユーザーが作成した無関係なファイルは触れない
- クリーンアップ成功後にのみ install-state を削除

### `doctor`

責務:

- 欠損した管理ファイルの検出
- 予期しない設定ドリフトの検出
- 存在しなくなったターゲットルートの検出
- マニフェスト/バージョンの不一致の検出

### `repair`

責務:

- install-state から望ましいオペレーションプランを再構築
- 欠損またはドリフトした管理ファイルを再コピー
- 要求されたモジュールが現在のマニフェストに存在しない場合、互換性マップがない限り修復を拒否

## レガシー互換性レイヤー

現在の `install.sh` が受け付ける入力:

- `--target <claude|cursor|antigravity>`
- 言語名のリスト

この動作はユーザーが既に依存しているため、一度に廃止できません。

ECC 2.0 はレガシー言語引数を互換性リクエストに変換すべきです。

推奨アプローチ:

1. レガシーモード用に既存の CLI 形状を維持
2. 言語名を以下のようなモジュールリクエストにマッピング:
   - `rules-core`
   - ターゲット互換のルールサブセット
3. レガシーインストールでも install-state を書き込む
4. リクエストに `legacyMode: true` のラベルを付与

例:

```json
{
  "request": {
    "legacyMode": true,
    "legacyLanguages": ["typescript", "python"]
  }
}
```

これにより、すべてのインストールを同じ状態コントラクトに移行しつつ、古い動作を維持できます。

## 公開境界

現在の npm パッケージは `package.json` を通じて依然として広いペイロードを公開しています。

ECC 2.0 はこれを慎重に改善すべきです。

推奨される順序:

1. まず1つの正規 npm パッケージを維持
2. 公開形状を変更する前に、マニフェストを使用してインストール時の選択を駆動
3. 安全な場合にのみ、後でパッケージ化サーフェスの縮小を検討

理由:

- selective install は積極的なパッケージ手術の前に出荷可能
- アンインストールと修復は公開変更よりも install-state に依存
- Codex/OpenCode サポートはパッケージソースが統一されている方が容易

将来の可能性のある方向:

- プロファイルごとの生成されたスリムバンドル
- ターゲット固有の生成 tarball
- 重いモジュールのオプションのリモートフェッチ

これらは Phase 3 以降であり、プロファイル対応インストールの前提条件ではありません。

## ファイルレイアウト推奨

推奨される次のファイル:

```text
scripts/lib/install-targets/
  claude-home.js
  cursor-project.js
  antigravity-project.js
  registry.js
scripts/lib/install-state.js
scripts/ecc.js
scripts/install-apply.js
scripts/list-installed.js
scripts/uninstall.js
scripts/doctor.js
scripts/repair.js
tests/lib/install-targets.test.js
tests/lib/install-state.test.js
tests/lib/install-lifecycle.test.js
```

`install.sh` は移行中のユーザー向けエントリポイントとして残せますが、ターゲットごとのシェルブランチを増やし続けるのではなく、Node ベースのプランナーとエグゼキューターの薄いシェルになるべきです。

## 実装シーケンス

### Phase 1: プランナーからコントラクトへ

1. 現在のマニフェストスキーマとリゾルバーを維持
2. 解決されたモジュール上にオペレーション計画を追加
3. `ecc.install.v1` 状態スキーマを定義
4. 成功したインストール時に install-state を書き込む

### Phase 2: ターゲットアダプター

1. Claude インストール動作を `claude-home` アダプターに抽出
2. Cursor インストール動作を `cursor-project` アダプターに抽出
3. Antigravity インストール動作を `antigravity-project` アダプターに抽出
4. `install.sh` を引数パースとアダプター呼び出しに縮小

### Phase 3: ライフサイクル

1. より強力なターゲット固有のマージ/削除セマンティクスを追加
2. 非コピーオペレーションの repair/uninstall カバレッジを拡張
3. パッケージ出荷サーフェスを広いフォルダーからモジュールグラフに縮小
4. `ecc-install` が `ecc install` の薄いエイリアスになるべきタイミングを決定

### Phase 4: 公開と将来のターゲット

1. `package.json` 公開サーフェスの安全な縮小を評価
2. `codex-home` を追加
3. `opencode-home` を追加
4. パッケージング圧力が高い場合は生成されたプロファイルバンドルを検討

## リポジトリローカルの直近の次のステップ

このリポジトリで最もシグナルの高い次の実装動作は:

1. 設定系モジュールにターゲット固有のマージ/削除セマンティクスを追加
2. 単純な copy-file オペレーション以外の repair と uninstall を拡張
3. パッケージ出荷サーフェスを広いフォルダーからモジュールグラフに縮小
4. `ecc-install` が独立したままか `ecc install` になるかを決定
5. 以下をロックダウンするテストを追加:
   - ターゲット固有のマージ/削除動作
   - 非コピーオペレーションの repair と uninstall の安全性
   - 統一 `ecc` CLI のルーティングと互換性保証

## 未解決の質問

1. ルールはレガシーモードで永久に言語アドレス可能であるべきか、移行ウィンドウ中のみか?
2. `platform-configs` は常に `core` と一緒にインストールされるべきか、より小さなターゲット固有モジュールに分割すべきか?
3. 設定マージセマンティクスはオペレーションレベルで記録すべきか、アダプターロジック内のみか?
4. 重いスキルファミリーは最終的にパッケージ時のインクルードではなくフェッチオンデマンドに移行すべきか?
5. Codex と OpenCode ターゲットアダプターは Claude/Cursor ライフサイクルコマンドが安定した後にのみ出荷すべきか?

## 推奨事項

現在のマニフェストリゾルバーをインストールのアダプター `0` として扱う:

1. 現在のインストールサーフェスを保持
2. 実際のコピー動作をターゲットアダプターの背後に移動
3. 成功したすべてのインストールで install-state を書き込む
4. アンインストール、doctor、repair を install-state のみに依存させる
5. その上でのみパッケージングの縮小やターゲットの追加を行う

これが ECC 1.x インストーラーの肥大化から、決定論的でサポート可能かつ拡張可能な ECC 2.0 インストール/コントロールコントラクトへの最短パスです。
