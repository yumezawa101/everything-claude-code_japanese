# claudecode-tool-ja

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Java](https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

> upstream: [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) の日本語版フォーク

---

Claude Code の設定を日本語化した個人用ツールキット。本番環境対応のエージェント、スキル、フック、コマンド、ルール、MCP設定を収録。

---

| トピック | 学べる内容 |
|-------|-------------------|
| トークン最適化 | モデル選択、システムプロンプト削減、バックグラウンドプロセス |
| メモリ永続化 | セッション間でコンテキストを自動保存/読み込みするフック |
| 継続的学習 | セッションからパターンを自動抽出して再利用可能なスキルに変換 |
| 検証ループ | チェックポイントと継続的評価、スコアラータイプ、pass@k メトリクス |
| 並列化 | Git ワークツリー、カスケード方法、スケーリング時期 |
| サブエージェント オーケストレーション | コンテキスト問題、反復検索パターン |

---

## クイックスタート

### ステップ 1: プラグインをインストール

```bash
/plugin marketplace add yumezawa101/everything-claude-code_japanese
/plugin install claudecode-tool-ja@claudecode-tool-ja
```

### ステップ 2: ルールをインストール（必須）

> **重要:** Claude Codeプラグインは`rules`を自動配布できません。手動でインストールしてください:

```bash
git clone https://github.com/yumezawa101/everything-claude-code_japanese.git

# 共通ルール（必須）
cp -r everything-claude-code_japanese/rules/common/* ~/.claude/rules/

# TypeScript/JavaScript ルール
cp -r everything-claude-code_japanese/rules/typescript/* ~/.claude/rules/

# クローンしたリポジトリを削除
rm -rf everything-claude-code_japanese
```

### ステップ 3: 使用開始

```bash
/claudecode-tool-ja:plan "ユーザー認証を追加"
```

**完了です!** これで8のエージェント、11のスキル、14のコマンドにアクセスできます。

---

## 含まれるもの

```
claudecode-tool-ja/
|-- agents/           # 専門サブエージェント（8種類）
|   |-- planner.md, architect.md, tdd-guide.md, code-reviewer.md,
|   |-- security-reviewer.md, build-error-resolver.md, e2e-runner.md,
|   |-- refactor-cleaner.md
|
|-- skills/           # ワークフロー定義と領域知識（11種類）
|   |-- coding-standards/, backend-patterns/, frontend-patterns/,
|   |-- security-review/, tdd-workflow/, verification-loop/,
|   |-- strategic-compact/, continuous-learning-v2/, configure-ecc/,
|   |-- agentic-engineering/, autonomous-loops/
|
|-- commands/         # スラッシュコマンド（14種類）
|   |-- plan.md, tdd.md, e2e.md, verify.md, code-review.md,
|   |-- build-fix.md, refactor-clean.md, test-coverage.md,
|   |-- orchestrate.md, learn.md, instinct-status.md,
|   |-- update-docs.md, update-codemaps.md, sessions.md
|
|-- rules/            # ガイドライン（~/.claude/rules/ にコピー）
|   |-- common/       # 言語非依存
|   |-- typescript/   # TypeScript/JavaScript 固有
|
|-- hooks/            # トリガーベースの自動化
|-- mcp-configs/      # MCP サーバー設定
```

---

## Skills & Commands

### Skills（11種）

| カテゴリ | 名前 | 説明 |
|---------|------|------|
| 開発標準 | **coding-standards** | TS/JS/React/Node のベストプラクティス |
| 開発標準 | **frontend-patterns** | React/Next.js フロントエンド |
| 開発標準 | **backend-patterns** | Node.js/Express/Next.js バックエンド |
| セキュリティ | **security-review** | 認証・入力・シークレットの包括的チェック |
| ワークフロー | **tdd-workflow** | TDD を強制、80%+ カバレッジ確保 |
| ワークフロー | **verification-loop** | コミット前の包括的検証（build/lint/test） |
| ワークフロー | **strategic-compact** | コンテキスト圧縮の戦略的提案 |
| 学習 | **continuous-learning-v2** | hook 経由で instinct として蓄積 |
| ツール | **configure-ecc** | このリポジトリのインタラクティブインストーラー |
| AI開発 | **agentic-engineering** | エージェント開発の基本指針 |
| AI開発 | **autonomous-loops** | 自律ループパターン |

### Commands（14種）

| コマンド | 説明 |
|---------|------|
| **`/plan`** | 要件を分析し段階的な実装計画を作成 |
| **`/tdd`** | テスト駆動開発ワークフローを強制 |
| **`/build-fix`** | ビルドエラーを段階的に修正 |
| **`/refactor-clean`** | デッドコードを安全に特定・削除 |
| **`/e2e`** | Playwright で E2E テスト |
| **`/test-coverage`** | カバレッジ分析・不足テスト自動生成 |
| **`/verify`** | build、型チェック、lint、テストを一括実行 |
| **`/code-review`** | セキュリティと品質の包括的レビュー |
| **`/orchestrate`** | 複雑なタスクの順次 agent ワークフロー |
| **`/learn`** | セッション分析→再利用パターンを skill として保存 |
| **`/instinct-status`** | 学習した instinct を信頼度付きで表示 |
| **`/update-docs`** | package.json/.env.example を信頼源にドキュメント同期 |
| **`/update-codemaps`** | コードマップ生成・更新 |
| **`/sessions`** | セッション履歴管理 |

### Agents（8種、Claude が自動起動）

planner, architect, tdd-guide, code-reviewer, security-reviewer, build-error-resolver, e2e-runner, refactor-cleaner

---

## 要件

**Claude Code CLI v2.1.0 以上**

```bash
claude --version
```

---

## 重要な注記

すべてのMCPを一度に有効にしないでください。多くのツールを有効にすると、200kのコンテキストウィンドウが70kに縮小される可能性があります。

経験則:
- 20-30のMCPを設定
- プロジェクトごとに10未満を有効化
- アクティブなツール80未満

---

## ライセンス

MIT
