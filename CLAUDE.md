# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際の Claude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

これは **Claude Code プラグイン** です。本番環境対応の agent、スキル、hooks、コマンド、ルール、MCP 設定のコレクションです。Claude Code を使用したソフトウェア開発のための実戦で検証済みのワークフローを提供します。

## アーキテクチャ

プロジェクトはいくつかのコアコンポーネントで構成されています:

- **agents/** - 委譲用の専門サブ agent（planner、code-reviewer、tdd-guide など）
- **skills/** - ワークフロー定義とドメイン知識（コーディング標準、パターン、テスト）
- **commands/** - ユーザーが呼び出すスラッシュコマンド（/tdd、/plan、/e2e など）
- **hooks/** - トリガーベースの自動化（セッション永続化、pre/post ツールフック）
- **rules/** - 常に従うガイドライン（セキュリティ、コーディングスタイル、テスト要件）
- **mcp-configs/** - 外部統合用の MCP サーバー設定

## 主要コマンド

- `/plan` - 実装計画
- `/tdd` - テスト駆動開発ワークフロー
- `/e2e` - E2E テストの生成と実行
- `/code-review` - 品質レビュー
- `/build-fix` - ビルドエラーの修正
- `/verify` - build、型チェック、lint、テストを一括実行
- `/refactor-clean` - デッドコード削除
- `/learn` - セッションからパターンを抽出

## 開発に関する注意事項

- Agent 形式: YAML frontmatter 付き Markdown（name, description, tools, model）
- スキル形式: 明確なセクションを持つ Markdown（使用タイミング、仕組み、例）
- Hook 形式: マッチャー条件と command/notification hooks を持つ JSON

## コントリビューション

以下の形式に従ってください（詳細は [upstream CONTRIBUTING.md](https://github.com/affaan-m/everything-claude-code/blob/main/CONTRIBUTING.md) を参照）:
- Agent: frontmatter 付き Markdown（name, description, tools, model）
- スキル: 明確なセクション（使用タイミング、仕組み、例）
- コマンド: description frontmatter 付き Markdown
- Hook: マッチャーと hooks 配列を持つ JSON

ファイル命名: 小文字のハイフン区切り（例: `code-reviewer.md`、`tdd-workflow.md`）
