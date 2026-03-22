# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際の Claude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

これは **Claude Code プラグイン** です。本番環境対応の agent、スキル、hooks、コマンド、ルール、MCP 設定のコレクションです。Claude Code を使用したソフトウェア開発のための実戦で検証済みのワークフローを提供します。

## テストの実行

```bash
# すべてのテストを実行
node tests/run-all.js

# 個別のテストファイルを実行
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

## アーキテクチャ

プロジェクトはいくつかのコアコンポーネントで構成されています:

- **agents/** - 委譲用の専門サブ agent（planner、code-reviewer、tdd-guide など）
- **skills/** - ワークフロー定義とドメイン知識（コーディング標準、パターン、テスト）
- **commands/** - ユーザーが呼び出すスラッシュコマンド（/tdd、/plan、/e2e など）
- **hooks/** - トリガーベースの自動化（セッション永続化、pre/post ツールフック）
- **rules/** - 常に従うガイドライン（セキュリティ、コーディングスタイル、テスト要件）
- **mcp-configs/** - 外部統合用の MCP サーバー設定
- **scripts/** - hooks とセットアップ用のクロスプラットフォーム Node.js ユーティリティ
- **tests/** - スクリプトとユーティリティのテストスイート

## 主要コマンド

- `/tdd` - テスト駆動開発ワークフロー
- `/plan` - 実装計画
- `/e2e` - E2E テストの生成と実行
- `/code-review` - 品質レビュー
- `/build-fix` - ビルドエラーの修正
- `/learn` - セッションからパターンを抽出
- `/skill-create` - git 履歴からスキルを生成

## 開発に関する注意事項

- パッケージマネージャ検出: npm, pnpm, yarn, bun（`CLAUDE_PACKAGE_MANAGER` 環境変数またはプロジェクト設定で設定可能）
- クロスプラットフォーム: Node.js スクリプトによる Windows、macOS、Linux サポート
- Agent 形式: YAML frontmatter 付き Markdown（name, description, tools, model）
- スキル形式: 明確なセクションを持つ Markdown（使用タイミング、仕組み、例）
- Hook 形式: マッチャー条件と command/notification hooks を持つ JSON

## コントリビューション

CONTRIBUTING.md の形式に従ってください:
- Agent: frontmatter 付き Markdown（name, description, tools, model）
- スキル: 明確なセクション（使用タイミング、仕組み、例）
- コマンド: description frontmatter 付き Markdown
- Hook: マッチャーと hooks 配列を持つ JSON

ファイル命名: 小文字のハイフン区切り（例: `python-reviewer.md`、`tdd-workflow.md`）
