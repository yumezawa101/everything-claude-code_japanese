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
