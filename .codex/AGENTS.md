# ECC for Codex CLI

これはルートの `AGENTS.md` を補完する Codex 固有のガイダンスです。

## 推奨モデル

| タスクの種類 | 推奨モデル |
|-------------|-----------|
| 定型的なコーディング、テスト、フォーマット | GPT 5.4 |
| 複雑な機能、アーキテクチャ | GPT 5.4 |
| デバッグ、リファクタリング | GPT 5.4 |
| セキュリティレビュー | GPT 5.4 |

## スキルの検出

スキルは `.agents/skills/` から自動的に読み込まれます。各スキルの構成:
- `SKILL.md` -- 詳細な手順とワークフロー
- `agents/openai.yaml` -- Codex インターフェースメタデータ

利用可能なスキル:
- tdd-workflow -- 80%以上のカバレッジによるテスト駆動開発
- security-review -- 包括的なセキュリティチェックリスト
- coding-standards -- 汎用コーディング標準
- frontend-patterns -- React/Next.js パターン
- frontend-slides -- ビューポート対応 HTML プレゼンテーションと PPTX からウェブへの変換
- article-writing -- メモと音声リファレンスからの長文ライティング
- content-engine -- プラットフォーム最適化されたソーシャルコンテンツと再利用
- market-research -- ソース付き市場・競合調査
- investor-materials -- デッキ、メモ、モデル、ワンペーパー
- investor-outreach -- パーソナライズされた投資家向けアウトリーチとフォローアップ
- backend-patterns -- API 設計、データベース、キャッシュ
- e2e-testing -- Playwright E2E テスト
- eval-harness -- 評価駆動開発
- strategic-compact -- コンテキスト管理
- api-design -- REST API 設計パターン
- verification-loop -- ビルド、テスト、lint、型チェック、セキュリティ
- deep-research -- firecrawl と exa MCP を使ったマルチソースリサーチ
- exa-search -- Exa MCP によるウェブ、コード、企業のニューラル検索
- claude-api -- Anthropic Claude API パターンと SDK
- x-api -- X/Twitter API 連携（投稿、スレッド、アナリティクス）
- crosspost -- マルチプラットフォームコンテンツ配信
- fal-ai-media -- fal.ai による AI 画像/動画/音声生成
- dmux-workflows -- dmux によるマルチエージェントオーケストレーション

## MCP サーバー

プロジェクトローカルの `.codex/config.toml` を ECC のデフォルト Codex ベースラインとして扱ってください。現在の ECC ベースラインは GitHub、Context7、Exa、Memory、Playwright、Sequential Thinking を有効化しています。より重いエクストラは、タスクが実際に必要とする場合のみ `~/.codex/config.toml` に追加してください。

## マルチエージェントサポート

Codex は実験的な `features.multi_agent` フラグの下でマルチエージェントワークフローをサポートしています。

- `.codex/config.toml` で `[features] multi_agent = true` を設定して有効化
- `[agents.<name>]` でプロジェクトローカルのロールを定義
- 各ロールを `.codex/agents/` 配下の TOML レイヤーに紐付け
- Codex CLI 内で `/agent` を使用して子エージェントの確認と制御

このリポジトリのサンプルロール設定:
- `.codex/agents/explorer.toml` -- 読み取り専用のエビデンス収集
- `.codex/agents/reviewer.toml` -- 正確性/セキュリティレビュー
- `.codex/agents/docs-researcher.toml` -- API とリリースノートの検証

## Claude Code との主な違い

| 機能 | Claude Code | Codex CLI |
|------|------------|-----------|
| Hooks | 8種類以上のイベントタイプ | 未サポート |
| コンテキストファイル | CLAUDE.md + AGENTS.md | AGENTS.md のみ |
| スキル | プラグイン経由で読み込み | `.agents/skills/` ディレクトリ |
| コマンド | `/slash` コマンド | 命令ベース |
| エージェント | サブエージェント Task ツール | `/agent` と `[agents.<name>]` ロールによるマルチエージェント |
| セキュリティ | Hook ベースの強制 | 命令 + サンドボックス |
| MCP | フルサポート | `config.toml` と `codex mcp add` でサポート |

## Hooks なしでのセキュリティ

Codex には hooks がないため、セキュリティの強制は命令ベースです:
1. システム境界で常に入力をバリデーションする
2. シークレットをハードコードしない -- 環境変数を使用する
3. コミット前に `npm audit` / `pip audit` を実行する
4. プッシュ前に必ず `git diff` を確認する
5. 設定で `sandbox_mode = "workspace-write"` を使用する
