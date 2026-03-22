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

# 言語固有ルール（スタックを選択）
cp -r everything-claude-code_japanese/rules/typescript/* ~/.claude/rules/
cp -r everything-claude-code_japanese/rules/python/* ~/.claude/rules/
cp -r everything-claude-code_japanese/rules/golang/* ~/.claude/rules/

# クローンしたリポジトリを削除
rm -rf everything-claude-code_japanese
```

### ステップ 3: 使用開始

```bash
/claudecode-tool-ja:plan "ユーザー認証を追加"
```

**完了です!** これで28のエージェント、116のスキル、59のコマンドにアクセスできます。

---

## 含まれるもの

```
claudecode-tool-ja/
|-- agents/           # 専門サブエージェント（28種類）
|   |-- planner.md, architect.md, tdd-guide.md, code-reviewer.md,
|   |-- security-reviewer.md, build-error-resolver.md, e2e-runner.md,
|   |-- refactor-cleaner.md, doc-updater.md, database-reviewer.md,
|   |-- chief-of-staff.md, typescript-reviewer.md, python-reviewer.md,
|   |-- go-reviewer.md, ...他 14 エージェント
|
|-- skills/           # ワークフロー定義と領域知識（116種類）
|   |-- coding-standards/, backend-patterns/, frontend-patterns/,
|   |-- tdd-workflow/, security-review/, continuous-learning-v2/,
|   |-- docker-patterns/, mcp-server-patterns/, api-design/, ...
|
|-- commands/         # スラッシュコマンド（59種類）
|   |-- tdd.md, plan.md, e2e.md, code-review.md, build-fix.md, ...
|
|-- rules/            # ガイドライン（~/.claude/rules/ にコピー）
|   |-- common/       # 言語非依存
|   |-- typescript/, python/, golang/, java/, kotlin/,
|   |-- rust/, cpp/, swift/, php/, perl/, csharp/
|
|-- hooks/            # トリガーベースの自動化
|-- scripts/          # クロスプラットフォーム Node.js スクリプト
|-- contexts/         # 動的コンテキスト
|-- examples/         # 設定例
|-- mcp-configs/      # MCP サーバー設定
```

---

## おすすめ Skills & Commands

### まずやるべきこと

| 種類 | 名前 | 説明 |
|------|------|------|
| skill | **continuous-learning-v2** | セッション中のパターンを自動検出し instinct として蓄積 |
| command | **`/evolve`** | 蓄積した instinct を skill/command/agent に自動変換 |
| skill | **codebase-onboarding** | 未知のコードベースを体系的に分析・マップ化 |
| skill | **verification-loop** | コミット前の包括的検証（build/lint/test） |
| skill | **tdd-workflow** | TDD を強制、80%+ カバレッジ確保 |

### 必須 Skills

| 名前 | 説明 |
|------|------|
| **coding-standards** | TS/JS/React/Node のベストプラクティス |
| **security-review** | 認証・入力・シークレットの包括的セキュリティチェック |
| **blueprint** | 1行の目標を複数セッションの実装計画に変換 |
| **architecture-decision-records** | アーキテクチャ決定を文脈付きで記録 |
| **e2e-testing** | Playwright E2E テストパターン |
| **documentation-lookup** | Context7 MCP で最新ドキュメントを取得 |

### 開発基盤 Skills

| 名前 | 説明 |
|------|------|
| **api-design** | REST API 設計パターン |
| **backend-patterns** | Node.js/Express/Next.js バックエンド |
| **frontend-patterns** | React/Next.js フロントエンド |
| **postgres-patterns** | PostgreSQL 最適化、RLS |
| **docker-patterns** | Docker Compose パターン |
| **deployment-patterns** | CI/CD、Docker、ロールバック |
| **database-migrations** | 安全なスキーマ変更 |
| **strategic-compact** | コンテキスト圧縮の戦略的提案 |
| **iterative-retrieval** | マルチ agent のコンテキスト問題解決 |
| **context-budget** | コンテキストウィンドウ消費の監査 |

### おすすめ Commands

| コマンド | 説明 |
|---------|------|
| **`/plan`** | 要件を分析し段階的な実装計画を作成 |
| **`/tdd`** | テスト駆動開発ワークフローを強制 |
| **`/code-review`** | セキュリティと品質の包括的レビュー |
| **`/build-fix`** | ビルドエラーを段階的に修正 |
| **`/evolve`** | instinct を skill/command/agent に変換 |
| **`/instinct-status`** | 学習した instinct を信頼度付きで表示 |
| **`/verify`** | build、型チェック、lint、テストを一括実行 |
| **`/refactor-clean`** | デッドコードを安全に特定・削除 |
| **`/orchestrate`** | 複雑なタスクの順次 agent ワークフロー |

### 言語/フレームワーク固有（51件）

Python, Go, Rust, Java/Spring, Kotlin/Android, PHP/Laravel, Swift/iOS, C++, Perl 等。`skills/` ディレクトリを参照。

### 専門ドメイン（40件）

AI エージェント構築、リサーチ、コンテンツ制作、サプライチェーン、動画編集等。`skills/` ディレクトリを参照。

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
