# ECC Selective Install 設計

## 目的

本ドキュメントは ECC のユーザー向け selective-install 設計を定義します。

内部ランタイムアーキテクチャとコード境界に焦点を当てた `docs/SELECTIVE-INSTALL-ARCHITECTURE.md` を補完します。

本ドキュメントはまずプロダクトとオペレーターの質問に回答します:

- ユーザーが ECC コンポーネントをどう選択するか
- CLI がどのような体験であるべきか
- どのような設定ファイルが存在すべきか
- ハーネスターゲット間でインストールがどう動作すべきか
- 設計が書き直しを必要とせずに現在の ECC コードベースにどうマッピングされるか

## 問題

現在の ECC はリポジトリにファーストパスのマニフェストとライフサイクルサポートがあるにもかかわらず、依然として大きなペイロードインストーラーのように感じられます。

ユーザーにはよりシンプルなメンタルモデルが必要です:

- ベースラインをインストール
- 実際に使用する言語パックを追加
- 実際に必要なフレームワーク設定を追加
- セキュリティ、リサーチ、オーケストレーションなどのオプション機能パックを追加

selective-install システムにより、ECC はオール・オア・ナッシングではなくコンポーザブルに感じられるべきです。

現在の基盤では、ユーザー向けコンポーネントは依然としてより粗い内部インストールモジュールのエイリアスレイヤーです。つまり include/exclude はモジュール選択レベルで既に有用ですが、一部のファイルレベルの境界は基盤のモジュールグラフがより細かく分割されるまで不完全なままです。

## 目標

1. ユーザーが小さなデフォルト ECC フットプリントを迅速にインストールできるようにする。
2. ユーザーが再利用可能なコンポーネントファミリーからインストールを構成できるようにする:
   - コアルール
   - 言語パック
   - フレームワークパック
   - 機能パック
   - ターゲット/プラットフォーム設定
3. Claude、Cursor、Antigravity、Codex、OpenCode 間で一貫した UX を維持。
4. インストールを検査可能、修復可能、アンインストール可能に保つ。
5. ロールアウト中は現在の `ecc-install typescript` スタイルとの後方互換性を維持。

## 非目標

- 第一フェーズで ECC を複数の npm パッケージに分割
- リモートマーケットプレイスの構築
- 同一フェーズでの完全なコントロールプレーン UI
- selective install の出荷前にすべてのスキル分類問題を解決

## ユーザーエクスペリエンスの原則

### 1. 小さく始める

ユーザーは1つのコマンドで有用な ECC インストールを取得できるべきです:

```bash
ecc install --target claude --profile core
```

デフォルトの体験は、ユーザーがすべてのスキルファミリーとすべてのフレームワークを望んでいると仮定すべきではありません。

### 2. 意図に基づいて構築

ユーザーは以下の観点で考えるべきです:

- 「開発者ベースラインが欲しい」
- 「TypeScript と Python が必要」
- 「Next.js と Django が欲しい」
- 「セキュリティパックが欲しい」

ユーザーは生の内部リポジトリパスを知る必要がないべきです。

### 3. ミューテーション前にプレビュー

すべてのインストールパスはドライラン計画をサポートすべきです:

```bash
ecc install --target cursor --profile developer --with lang:typescript --with framework:nextjs --dry-run
```

プランは以下を明確に表示すべきです:

- 選択されたコンポーネント
- スキップされたコンポーネント
- ターゲットルート
- 管理パス
- 想定される install-state の場所

### 4. ローカル設定をファーストクラスに

チームはプロジェクトレベルのインストール設定をコミットし、以下を使用できるべきです:

```bash
ecc install --config ecc-install.json
```

これにより、コントリビューターと CI 間で決定論的なインストールが可能になります。

## コンポーネントモデル

現在のマニフェストは既にインストールモジュールとプロファイルを使用しています。ユーザー向け設計はその内部構造を維持しつつ、4つの主要コンポーネントファミリーとして提示すべきです。

短期的な実装の注意: 一部のユーザー向けコンポーネント ID は、特に言語/フレームワークレイヤーで共有内部モジュールに解決されます。カタログは UX を即座に改善しつつ、後のフェーズでより細かいモジュール粒度へのクリーンなパスを保持します。

### 1. ベースライン

ECC のデフォルト構成要素:

- コアルール
- ベースライン agent
- コアコマンド
- ランタイム hook
- プラットフォーム設定
- ワークフロー品質プリミティブ

現在の内部モジュールの例:

- `rules-core`
- `agents-core`
- `commands-core`
- `hooks-runtime`
- `platform-configs`
- `workflow-quality`

### 2. 言語パック

言語パックは言語エコシステム向けのルール、ガイダンス、ワークフローをグループ化します。

例:

- `lang:typescript`
- `lang:python`
- `lang:go`
- `lang:java`
- `lang:rust`

各言語パックは1つ以上の内部モジュールとターゲット固有のアセットに解決されるべきです。

### 3. フレームワークパック

フレームワークパックは言語パックの上に位置し、フレームワーク固有のルール、スキル、オプションのセットアップを取り込みます。

例:

- `framework:react`
- `framework:nextjs`
- `framework:django`
- `framework:springboot`
- `framework:laravel`

フレームワークパックは適切な場合、正しい言語パックまたはベースラインプリミティブに依存すべきです。

### 4. 機能パック

機能パックは横断的な ECC 機能バンドルです。

例:

- `capability:security`
- `capability:research`
- `capability:orchestration`
- `capability:media`
- `capability:content`

これらはマニフェストで既に導入されている現在のモジュールファミリーにマッピングされるべきです。

## プロファイル

プロファイルは最速のオンランプのままです。

推奨されるユーザー向けプロファイル:

- `core`
  最小ベースライン、ECC を試すほとんどのユーザーに安全なデフォルト
- `developer`
  アクティブなソフトウェアエンジニアリング作業に最適なデフォルト
- `security`
  ベースラインにセキュリティ重視のガイダンスを追加
- `research`
  ベースラインにリサーチ/コンテンツ/調査ツールを追加
- `full`
  分類済みかつ現在サポートされているすべて

プロファイルは追加の `--with` と `--without` フラグでコンポーザブルであるべきです。

例:

```bash
ecc install --target claude --profile developer --with lang:typescript --with framework:nextjs --without capability:orchestration
```

## 提案される CLI 設計

### 主要コマンド

```bash
ecc install
ecc plan
ecc list-installed
ecc doctor
ecc repair
ecc uninstall
ecc catalog
```

### Install CLI

推奨される形状:

```bash
ecc install [--target <target>] [--profile <name>] [--with <component>]... [--without <component>]... [--config <path>] [--dry-run] [--json]
```

例:

```bash
ecc install --target claude --profile core
ecc install --target cursor --profile developer --with lang:typescript --with framework:nextjs
ecc install --target antigravity --with capability:security --with lang:python
ecc install --config ecc-install.json
```

### Plan CLI

推奨される形状:

```bash
ecc plan [same selection flags as install]
```

目的:

- ミューテーションなしでプレビューを生成
- selective install の正規デバッグサーフェスとして機能

### Catalog CLI

推奨される形状:

```bash
ecc catalog profiles
ecc catalog components
ecc catalog components --family language
ecc catalog show framework:nextjs
```

目的:

- ユーザーがドキュメントを読まずに有効なコンポーネント名を発見
- 設定のオーサリングを親しみやすく保つ

### 互換性 CLI

移行中はこれらのレガシーフローが引き続き動作すべきです:

```bash
ecc-install typescript
ecc-install --target cursor typescript
ecc typescript
```

内部的にはこれらが新しいリクエストモデルに正規化され、モダンインストールと同じ方法で install-state を書き込むべきです。

## 提案される設定ファイル

### ファイル名

推奨デフォルト:

- `ecc-install.json`

将来のオプションサポート:

- `.ecc/install.json`

### 設定の形状

```json
{
  "$schema": "./schemas/ecc-install-config.schema.json",
  "version": 1,
  "target": "cursor",
  "profile": "developer",
  "include": [
    "lang:typescript",
    "lang:python",
    "framework:nextjs",
    "capability:security"
  ],
  "exclude": [
    "capability:media"
  ],
  "options": {
    "hooksProfile": "standard",
    "mcpCatalog": "baseline",
    "includeExamples": false
  }
}
```

### フィールドセマンティクス

- `target`
  `claude`、`cursor`、`antigravity` などの選択されたハーネスターゲット
- `profile`
  開始元となるベースラインプロファイル
- `include`
  追加するコンポーネント
- `exclude`
  プロファイル結果から除外するコンポーネント
- `options`
  コンポーネントのアイデンティティを変更しないターゲット/ランタイムチューニングフラグ

### 優先順位ルール

1. CLI 引数が設定ファイルの値をオーバーライド。
2. 設定ファイルがプロファイルデフォルトをオーバーライド。
3. プロファイルデフォルトが内部モジュールデフォルトをオーバーライド。

これにより動作が予測可能で説明しやすくなります。

## モジュラーインストールフロー

ユーザー向けフローは:

1. 提供された、または自動検出された設定ファイルを読み込む
2. 設定意図の上に CLI 意図をマージ
3. リクエストを正規選択に正規化
4. プロファイルをベースラインコンポーネントに展開
5. `include` コンポーネントを追加
6. `exclude` コンポーネントを除外
7. 依存関係とターゲット互換性を解決
8. プランをレンダリング
9. ドライランモードでなければオペレーションを適用
10. install-state を書き込む

重要な UX 特性は、まったく同じフローが以下を駆動すること:

- `install`
- `plan`
- `repair`
- `uninstall`

コマンドはアクションが異なるだけで、ECC が選択されたインストールを理解する方法は同じです。

## ターゲット動作

Selective install はすべてのターゲットで同じ概念的コンポーネントグラフを保持しつつ、ターゲットアダプターがコンテンツのランディング方法を決定できるようにすべきです。

### Claude

最適な用途:

- ホームスコープの ECC ベースライン
- コマンド、agent、ルール、hook、プラットフォーム設定、オーケストレーション

### Cursor

最適な用途:

- プロジェクトスコープのインストール
- ルールとプロジェクトローカルの自動化と設定

### Antigravity

最適な用途:

- プロジェクトスコープの agent/ルール/ワークフローインストール

### Codex / OpenCode

インストーラーの特殊フォークではなく、追加ターゲットとして残るべきです。

selective-install 設計はこれらを新しいインストーラーアーキテクチャではなく、新しいアダプターと新しいターゲット固有マッピングルールにするだけであるべきです。

## 技術的実現可能性

リポジトリには既に以下が存在するため、この設計は実現可能です:

- インストールモジュールとプロファイルマニフェスト
- install-state パス付きのターゲットアダプター
- プラン検査
- install-state の記録
- ライフサイクルコマンド
- 統一 `ecc` CLI サーフェス

欠けている作業は概念的な発明ではありません。欠けている作業は、現在の基盤をよりクリーンなユーザー向けコンポーネントモデルに製品化することです。

### Phase 1 で実現可能

- プロファイル + include/exclude 選択
- `ecc-install.json` 設定ファイルパース
- カタログ/発見コマンド
- ユーザー向けコンポーネント ID から内部モジュールセットへのエイリアスマッピング
- ドライランと JSON 計画

### Phase 2 で実現可能

- より豊富なターゲットアダプターセマンティクス
- 設定系アセットのマージ対応オペレーション
- 非コピーオペレーションに対するより強力な repair/uninstall 動作

### 後日

- 公開サーフェスの縮小
- 生成されたスリムバンドル
- リモートコンポーネントフェッチ

## 現在の ECC マニフェストへのマッピング

現在のマニフェストはまだ真のユーザー向け `lang:*` / `framework:*` / `capability:*` タクソノミーを公開していません。これは2番目のインストーラーエンジンとしてではなく、既存モジュールの上のプレゼンテーションレイヤーとして導入されるべきです。

推奨アプローチ:

- `install-modules.json` を内部解決カタログとして維持
- フレンドリーなコンポーネント ID を1つ以上の内部モジュールにマッピングするユーザー向けコンポーネントカタログを追加
- 移行ウィンドウ中はプロファイルが内部モジュールまたはユーザー向けコンポーネント ID のいずれかを参照可能に

これにより、UX を改善しつつ現在の selective-install 基盤を壊さずに済みます。

## 推奨ロールアウト

### Phase 1: 設計と探索

- ユーザー向けコンポーネントタクソノミーの確定
- 設定スキーマの追加
- CLI 設計と優先順位ルール

### Phase 2: ユーザー向け解決レイヤー

- コンポーネントエイリアスの実装
- 設定ファイルパースの実装
- `include` / `exclude` の実装
- `catalog` の実装

### Phase 3: より強力なターゲットセマンティクス

- より多くのロジックをターゲット所有の計画に移動
- マージ/生成オペレーションのクリーンなサポート
- repair/uninstall 忠実度の改善

### Phase 4: パッケージング最適化

- 公開サーフェスの縮小
- 生成バンドルの評価

## 推奨事項

次の実装の動きは「インストーラーの書き直し」であるべきではありません。

以下であるべきです:

1. 現在のマニフェスト/ランタイム基盤を維持
2. ユーザー向けコンポーネントカタログと設定ファイルを追加
3. `include` / `exclude` 選択とカタログ発見を追加
4. 既存のプランナーとライフサイクルスタックにそのモデルを消費させる

これが、現在の ECC コードベースから大きなレガシーインストーラーではなく ECC 2.0 のように感じられる真の selective install 体験への最短パスです。
