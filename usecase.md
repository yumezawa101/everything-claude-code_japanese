# claudecode-tool-ja ユースケースガイド

## 目次

1. [日常開発でのユースケース](#日常開発でのユースケース)
2. [プロダクト企画〜リリースの一連フロー](#プロダクト企画リリースの一連フロー)
3. [具体例: 筋トレウェブアプリを新規開発する場合](#具体例-筋トレウェブアプリを新規開発する場合)

---

## 日常開発でのユースケース

### 1. コードレビュー（`/code-review` コマンド + `code-reviewer` エージェント）

```bash
# コマンドとして実行
> /code-review

# または Claude が自動的にエージェントを起動
> このPRの変更をレビューして
```

**場面**: コミット前に品質・セキュリティの問題を自動検出したいとき。ファイルタイプ別のチェック（TypeScript の型安全性、React の再レンダリング、API の入力バリデーション等）を実行し、重大度付きレポートを生成する。

### 2. 機能設計・計画（`/plan` コマンド + `planner` エージェント）

```bash
> /plan ユーザー認証機能を追加したい
```

**場面**: 複雑な機能の実装前に、影響範囲の把握・ステップ分解・リスク分析が必要なとき。既存コードベースを分析し、フェーズ分けされた実装計画を生成する。

### 3. テスト駆動開発（`/tdd` コマンド + `tdd-guide` エージェント）

```bash
> /tdd calculateTotal 関数を TDD で実装して
```

**場面**: RED → GREEN → IMPROVE のサイクルを強制し、テストファーストで開発したいとき。まずテストを書いて失敗を確認し、最小限の実装でパスさせ、リファクタリングする流れを自動化する。

### 4. セキュリティ監査（`security-reviewer` エージェント）

```bash
> このAPIエンドポイントのセキュリティをレビューして
```

**場面**: OWASP Top 10 に基づく脆弱性チェック。SQLインジェクション、XSS、SSRF、ハードコードされたシークレット等を検出し、修正コード例付きで報告する。

### 5. ビルドエラー解決（`/build-fix` + `build-error-resolver` エージェント）

```bash
> /build-fix
```

**場面**: `npm run build` や `tsc` で大量のエラーが出たとき。エラーを分析して根本原因を特定し、修正を提案・適用する。

### 6. リファクタリング（`/refactor-clean` + `refactor-cleaner` エージェント）

```bash
> /refactor-clean src/services/
```

**場面**: デッドコードの除去、大きすぎる関数の分割、重複コードの統合をしたいとき。

### 7. E2E テスト（`/e2e` + `e2e-runner` エージェント）

```bash
> /e2e ログインフローのE2Eテストを作って
```

**場面**: Playwright を使ったエンドツーエンドテストを自動作成・実行したいとき。

### 8. フック（自動化）

フックは手動で呼ぶ必要がなく、自動的に動作する。

| トリガー | 何が起きるか |
|----------|-------------|
| `.ts/.js` ファイルを編集 | Prettier で自動フォーマット |
| `.ts/.tsx` ファイルを編集 | TypeScript 型チェックが走る |
| JS/TS ファイルを編集 | `console.log` が残っていたら警告 |
| `npm run dev` を実行 | tmux 外ならブロックして tmux を促す |
| `git push` を実行 | プッシュ前にレビューリマインダー |
| 50回ツールを使用 | `/compact` を提案（コンテキスト節約） |
| セッション終了時 | セッション状態を永続化・パターン評価 |

### 9. パターン学習（`/learn` + `continuous-learning-v2`）

```bash
> /learn このリファクタリングのパターンを記録して
```

**場面**: 開発中に発見した良いパターンやアンチパターンを Claude に学習させ、次回以降のセッションで活用したいとき。

### 10. スキル自動生成（`/skill-create`）

```bash
> /skill-create
```

**場面**: リポジトリの Git 履歴から頻出パターンを分析し、再利用可能な skill ファイルを自動生成したいとき。

---

## プロダクト企画〜リリースの一連フロー

### Phase 1: リサーチ・要件整理

```bash
> @context research
> 既存の関連コードと基盤を調査して、影響範囲を分析して
```

**使うもの**: `research` コンテキスト（「まず調べてから判断」モード）

research コンテキストは結論を急がず、広く読んでから判断する探索モード。既存コードの構造や制約を理解するフェーズに最適。

### Phase 2: アーキテクチャ設計

```bash
> architect エージェントでアーキテクチャを設計して
```

**使うもの**: `architect` エージェント + `backend-patterns` / `postgres-patterns` スキル

architect エージェントが以下を出力する：

- データモデル設計（テーブル設計、RLS ポリシー）
- API エンドポイント設計
- 技術選定の根拠（ADR: Architecture Decision Record）
- スケーラビリティの考慮点

### Phase 3: 実装計画の策定

```bash
> /plan アーキテクチャに基づいて実装計画を立てて
```

**使うもの**: `/plan` コマンド → `planner` エージェント

フェーズ分けされた計画が生成される。

### Phase 4: TDD で実装

```bash
> @context dev
> /tdd フェーズ1を実装して
```

**使うもの**: `dev` コンテキスト + `/tdd` コマンド + `tdd-guide` エージェント

RED → GREEN → IMPROVE サイクルで各フェーズを実装する。
ビルドエラーが出た場合は `/build-fix` で対処。

### Phase 5: レビュー

```bash
> database-reviewer でスキーマ変更をレビューして
> security-reviewer でセキュリティをレビューして
> /code-review
```

**使うもの**: `database-reviewer` + `security-reviewer` + `code-reviewer` エージェント

### Phase 6: E2E テスト + カバレッジ

```bash
> /e2e クリティカルなユーザーフローをテストして
> /test-coverage
```

**使うもの**: `/e2e` + `/test-coverage` コマンド

### Phase 7: リファクタ + ドキュメント

```bash
> /refactor-clean
> /update-docs
> /update-codemaps
```

**使うもの**: `/refactor-clean` + `/update-docs` + `/update-codemaps`

### Phase 8: 最終検証 + デプロイ

```bash
> /verify
> /pm2 で本番環境にデプロイして
```

**使うもの**: `/verify` + `/pm2`

### Phase 9: 学習の蓄積

```bash
> /learn 今回得たパターンを記録して
> /evolve
```

**使うもの**: `/learn` → `/evolve` + `continuous-learning-v2` スキル

### フロー全体図

```text
リサーチ       → @context research
    ↓
アーキテクチャ → architect エージェント
    ↓
計画          → /plan
    ↓
実装          → @context dev + /tdd     ←→ /build-fix（エラー時）
    ↓
DB レビュー   → database-reviewer
    ↓
セキュリティ  → security-reviewer
    ↓
コードレビュー → /code-review
    ↓
E2E テスト    → /e2e + /test-coverage
    ↓
クリーンアップ → /refactor-clean
    ↓
ドキュメント  → /update-docs + /update-codemaps
    ↓
最終確認      → /verify
    ↓
デプロイ      → /pm2
    ↓
学習          → /learn + /evolve
```

---

## 具体例: 筋トレウェブアプリを新規開発する場合

### Step 1: プロジェクト初期化 + リサーチ

```bash
# まず空のプロジェクトを作る
> Next.js + TypeScript + Supabase でプロジェクトを初期化して

# research モードで競合・要件を調査
> @context research
> 筋トレ記録アプリに必要な機能を洗い出して。
  既存アプリ（Strong, JEFIT等）の主要機能も参考に
```

この段階で Claude が要件リストを整理する：

- ユーザー認証（Google/メール）
- エクササイズマスタ管理
- ワークアウト記録（セット数・重量・レップ数）
- トレーニング履歴・カレンダー表示
- 進捗グラフ（1RM推移など）
- ルーティンテンプレート

### Step 2: アーキテクチャ設計

```bash
> architect エージェントで筋トレアプリのアーキテクチャを設計して。
  技術スタック: Next.js App Router, Supabase, Tailwind CSS
  要件: 上で洗い出した機能一覧
```

architect が以下を設計する：

- **DB スキーマ**: `users`, `exercises`, `workouts`, `workout_sets`, `routines` 等
- **API 設計**: Server Actions or Route Handlers
- **認証方式**: Supabase Auth
- **フロントエンド構成**: ページ構成、コンポーネント設計

### Step 3: 実装計画

```bash
> /plan アーキテクチャに基づいて実装計画を立てて。
  MVP として最初にリリースする機能を絞って
```

planner が MVP を切り出す：

```text
フェーズ1: 認証 + ユーザープロフィール
フェーズ2: エクササイズマスタ + 検索
フェーズ3: ワークアウト記録（コア機能）
フェーズ4: 履歴表示 + 進捗グラフ
フェーズ5: E2Eテスト + デプロイ
```

### Step 4: フェーズごとに TDD で実装

#### フェーズ1: 認証

```bash
> @context dev
> /tdd Supabase Auth でGoogle認証とメール認証を実装して
```

tdd-guide が以下のサイクルを回す：

```text
RED:   ログインページのテストを書く → 失敗
GREEN: Supabase Auth の実装 → パス
IMPROVE: エラーハンドリング改善
```

#### フェーズ2: エクササイズマスタ

```bash
> /tdd エクササイズのCRUDと検索機能を実装して。
  部位（胸・背中・脚等）でフィルタできるように
```

#### フェーズ3: ワークアウト記録（コア）

```bash
> /tdd ワークアウト記録機能を実装して。
  - 日付を選んでワークアウト開始
  - エクササイズを追加
  - セットごとに重量・レップ数を入力
  - 前回の記録を参考表示
```

ここが一番大きいので、途中でビルドエラーが出たら：

```bash
> /build-fix
```

### Step 5: DB レビュー

```bash
> database-reviewer で今回のスキーマをレビューして。
  特にワークアウト記録のクエリパフォーマンスと
  RLS ポリシーを確認して
```

database-reviewer が以下を指摘する：

- `workout_sets` テーブルに `(workout_id, exercise_id)` の複合インデックスが必要
- `workouts` の RLS で `auth.uid() = user_id` が漏れている箇所
- 履歴取得クエリの N+1 問題

### Step 6: セキュリティレビュー

```bash
> security-reviewer でユーザーデータ周りをレビューして
```

筋トレアプリでも重要なチェック：

- 他人のワークアウトデータにアクセスできないか（認可）
- RLS が全テーブルに適用されているか
- API エンドポイントに入力バリデーションがあるか

### Step 7: フェーズ4 の実装（履歴・グラフ）

```bash
> /tdd 履歴カレンダーと1RM推移グラフを実装して。
  グラフは recharts を使って
```

### Step 8: コードレビュー + リファクタ

```bash
# 全体のコードレビュー
> /code-review

# 不要コードの除去
> /refactor-clean
```

### Step 9: E2E テスト

```bash
> /e2e 以下のユーザーフローをテストして：
  1. 新規登録 → ログイン
  2. エクササイズ検索 → ワークアウト開始
  3. セット記録 → 保存
  4. 履歴で今日の記録を確認
```

### Step 10: カバレッジ確認 + 最終検証

```bash
> /test-coverage
> /verify
```

### Step 11: ドキュメント + デプロイ

```bash
> /update-docs
> /update-codemaps

# Vercel にデプロイ
> Vercel にデプロイして。環境変数の設定も含めて
```

### Step 12: 学んだパターンを蓄積

```bash
> /learn Supabase RLS + Next.js Server Actions のパターンを記録して
> /learn ワークアウト記録UIのフォーム状態管理パターンを記録して
```

次のプロジェクト（例: 食事管理アプリ）で自動的にこの知見が活用される。

### 実際の作業イメージ（時系列）

```text
Day 1  │ リサーチ + アーキテクチャ + 計画
       │  @context research → architect → /plan
       │
Day 2  │ 認証 + エクササイズマスタ
       │  @context dev → /tdd × 2
       │
Day 3  │ ワークアウト記録（コア機能）
       │  /tdd → /build-fix（必要に応じて）
       │
Day 4  │ 履歴・グラフ + レビュー
       │  /tdd → database-reviewer → security-reviewer
       │
Day 5  │ テスト + リファクタ + デプロイ
       │  /e2e → /code-review → /refactor-clean → /verify → デプロイ
```

**ポイント**: 全部のツールを使う必要はない。最小構成なら `/plan` → `/tdd` → `/code-review` → `/verify` の4つだけで十分回る。規模やチーム要件に応じて、セキュリティレビューや DB レビューを追加すること。

---

## MVP 開発を加速する MCP サーバー構成

### 推奨 MCP サーバー

MVP 開発に特に効果的な MCP サーバーの組み合わせ：

| MCP | 用途 |
|-----|------|
| **Figma** | デザイン → コード変換。レイヤー構造・トークンを直接読み取る |
| **Context7** | ライブラリの最新ドキュメントをリアルタイム取得 |
| **Supabase** | DB 操作・認証・ストレージを直接操作 |
| **GitHub** | PR・Issue・CI/CD を Claude から直接操作 |
| **Playwright** | 実際のブラウザを操作して E2E テスト自動生成 |
| **Task Master** | PRD（要件書）を構造化タスクリストに変換 |
| **Sequential Thinking** | 複雑な設計判断で段階的に考える |
| **Vercel** | ワンコマンドでデプロイ・プレビュー環境 |

### Figma MCP の活用

Figma MCP はスクリーンショットではなく、デザインの構造データを直接読み取る：

- レイヤー階層（div の入れ子構造）
- Auto Layout（Flexbox/Grid 対応）
- デザイントークン（色・フォント・余白）
- コンポーネントのバリアント
- レスポンシブの意図

#### セットアップ

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

#### 使い方

```bash
# Figma でワイヤーフレームを描いて、リンクを渡すだけ
> この Figma デザインを元に Next.js + Tailwind でページを実装して
  https://www.figma.com/design/xxxxx?node-id=1:234
```

Claude がデザインのレイヤー構造・色・フォント・配置を読み取り、
セマンティック HTML + Tailwind クラス + コンポーネント分割を含むコードを生成する。

#### FigJam との連携

FigJam（ホワイトボード）のデータも読める：

```bash
# FigJam で描いた画面フロー図から、ルーティング構造を自動生成
> この FigJam のフロー図を元に、Next.js のルーティング構造と
  ページコンポーネントの雛形を作って
```

#### 知っておくべき制限

| 制限 | 対処法 |
|------|--------|
| 既存コードの「部分更新」は苦手 | 新規コンポーネント生成に使い、既存コードは手動で統合 |
| 複数フレームの連携は一度にできない | フレーム単位で変換し、後で結合 |
| ビジュアルの微調整はできない | 生成後にブラウザで確認・手動調整 |
| Figma → コードの一方通行 | コード → Figma への反映はできない |

### MVP 要件定義のベストプラクティス

#### よくある失敗パターン

```text
「アプリ作りたい」→ いきなり /plan → 機能が多すぎて完成しない
```

#### 推奨: 3段階で要件を絞り込む

**1. ユーザーストーリーで「誰の何を解決するか」を固める**

```bash
> @context research
> 筋トレ初心者が「今日何をやればいいかわからない」問題を解決する
  アプリを考えたい。ユーザーストーリーを5つ以内で書いて
```

**2. 「なくても成立するもの」を削る**

```bash
> この中で、1機能だけでユーザーに価値を届けられるのはどれ？
  残りは v2 以降に回して
```

判断基準：

- その機能がないとアプリを使う理由がなくなるか？ → 残す
- あると便利だが、なくても最低限使えるか？ → 削る

**3. 1画面で描けるレベルまで具体化する**

```bash
> MVP の画面フローを書いて。画面数は3つ以内に収めて
```

ここまで絞れたら `/plan` に渡す。

### Figma 込みの MVP 開発フロー

```text
従来:     要件定義 → デザイン → HTML/CSS手書き → ロジック実装（数週間）
Figma込:  要件定義 → Figma ラフ → 自動変換 → ロジック実装（数日）
```

```text
1. 要件整理       → @context research + ユーザーストーリー
2. ワイヤーフレーム → Figma で3画面程度（手描きレベルで OK）
3. 計画           → /plan（Figma リンク付き）
4. UI 自動生成    → Figma MCP でデザイン → コード変換
5. ロジック実装   → /tdd でバックエンドロジック
6. レビュー       → /code-review + security-reviewer
7. デプロイ       → /verify → Vercel
```
