# Everything Claude Code (Japanese)

Claude Code の設定を日本語化し、自分の開発ワークフローに合わせてカスタマイズした個人用ツールキット。本番環境対応の agent、skill、hook、command、rule、MCP 設定を収録。

---

## クイックスタート

2分以内でセットアップ完了：

### ステップ 1: プラグインをインストール

```bash
# マーケットプレイスを追加
/plugin marketplace add yumezawa101/everything-claude-code_japanese

# プラグインをインストール
/plugin install everything-claude-code@everything-claude-code
```

### ステップ 2: ルールをインストール（必須）

> **重要:** Claude Code のプラグインシステムでは rules を自動配布できません。手動でインストールしてください：

```bash
# リポジトリをクローン
git clone https://github.com/yumezawa101/everything-claude-code_japanese.git

# 共通ルールをインストール（必須）
cp -r everything-claude-code_japanese/rules/common/* ~/.claude/rules/

# 言語固有ルールをインストール（使用する言語に合わせて選択）
cp -r everything-claude-code_japanese/rules/typescript/* ~/.claude/rules/
```

### ステップ 3: 使い始める

```bash
# コマンドを試す
/plan "Add user authentication"

# 利用可能なコマンドを確認
/plugin list everything-claude-code@everything-claude-code
```

**以上です！** これで 10 種類の agent、15 種類の skill、27 種類の command が使えます。

---

## クロスプラットフォームサポート

このプラグインは **Windows、macOS、Linux** を完全サポートしています。すべての hook とスクリプトは最大限の互換性のために Node.js で書き直されました。

### パッケージマネージャー検出

プラグインは以下の優先順位で優先パッケージマネージャー（npm、pnpm、yarn、または bun）を自動検出します：

1. **環境変数**: `CLAUDE_PACKAGE_MANAGER`
2. **プロジェクト設定**: `.claude/package-manager.json`
3. **package.json**: `packageManager` フィールド
4. **ロックファイル**: package-lock.json、yarn.lock、pnpm-lock.yaml、または bun.lockb から検出
5. **グローバル設定**: `~/.claude/package-manager.json`
6. **フォールバック**: 利用可能な最初のパッケージマネージャー

優先パッケージマネージャーを設定するには：

```bash
# 環境変数経由
export CLAUDE_PACKAGE_MANAGER=pnpm

# グローバル設定経由
node scripts/setup-package-manager.js --global pnpm

# プロジェクト設定経由
node scripts/setup-package-manager.js --project bun

# 現在の設定を検出
node scripts/setup-package-manager.js --detect
```

または Claude Code で `/setup-pm` command を使用してください。

---

## 内容

このリポジトリは **Claude Code プラグイン** です - 直接インストールするか、手動でコンポーネントをコピーできます。

| ディレクトリ | 内容 | 数 |
|---|---|---|
| `agents/` | 特化型サブエージェント（計画、レビュー、TDD、セキュリティなど） | 10 |
| `skills/` | ワークフロー定義とドメイン知識 | 15 |
| `commands/` | スラッシュコマンド（/plan、/tdd、/code-review など） | 27 |
| `rules/` | 常に従うガイドライン（common + typescript） | 13 |
| `hooks/` | トリガーベースの自動化 | 1 |
| `contexts/` | 動的コンテキスト（dev、review、research） | 3 |
| `scripts/` | クロスプラットフォーム Node.js スクリプト | - |
| `tests/` | テストスイート | - |
| `mcp-configs/` | MCP サーバー設定 | 1 |
| `examples/` | 設定例とセッション例 | 2+ |

---

## インストール

### オプション 1: プラグインとしてインストール（推奨）

`~/.claude/settings.json` に以下を追加：

```json
{
  "extraKnownMarketplaces": {
    "everything-claude-code": {
      "source": {
        "source": "github",
        "repo": "yumezawa101/everything-claude-code_japanese"
      }
    }
  },
  "enabledPlugins": {
    "everything-claude-code@everything-claude-code": true
  }
}
```

これですべての command、agent、skill、hook に即座にアクセスできます。

> **注意:** Claude Code のプラグインシステムでは rules を自動配布できません。手動でインストールしてください：
>
> ```bash
> # リポジトリをクローン
> git clone https://github.com/yumezawa101/everything-claude-code_japanese.git
>
> # オプション A: ユーザーレベル（全プロジェクトに適用）
> cp -r everything-claude-code_japanese/rules/common/* ~/.claude/rules/
> cp -r everything-claude-code_japanese/rules/typescript/* ~/.claude/rules/   # 使用する言語に合わせて選択
>
> # オプション B: プロジェクトレベル（現在のプロジェクトのみ）
> mkdir -p .claude/rules
> cp -r everything-claude-code_japanese/rules/common/* .claude/rules/
> cp -r everything-claude-code_japanese/rules/typescript/* .claude/rules/     # 使用する言語に合わせて選択
> ```

---

### オプション 2: 手動インストール

インストール内容を手動で制御したい場合：

```bash
# リポジトリをクローン
git clone https://github.com/yumezawa101/everything-claude-code_japanese.git

# agent を Claude 設定にコピー
cp everything-claude-code_japanese/agents/*.md ~/.claude/agents/

# rule をコピー（common + 言語固有）
cp -r everything-claude-code_japanese/rules/common/* ~/.claude/rules/
cp -r everything-claude-code_japanese/rules/typescript/* ~/.claude/rules/   # 使用する言語に合わせて選択

# command をコピー
cp everything-claude-code_japanese/commands/*.md ~/.claude/commands/

# skill をコピー
cp -r everything-claude-code_japanese/skills/* ~/.claude/skills/
```

#### settings.json に hook を追加

`hooks/hooks.json` から hook を `~/.claude/settings.json` にコピーしてください。

#### MCP を設定

`mcp-configs/mcp-servers.json` から必要な MCP サーバーを `~/.claude.json` にコピーしてください。

**重要:** `YOUR_*_HERE` プレースホルダーを実際の API キーに置き換えてください。

---

## 主要コンセプト

### Agents

サブエージェントは限定されたスコープで委譲されたタスクを処理します。例：

```markdown
---
name: code-reviewer
description: 品質、セキュリティ、保守性のためにコードをレビューする
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

あなたはシニアコードレビュアーです...
```

### Skills

skill は command または agent によって呼び出されるワークフロー定義です：

```markdown
# TDD ワークフロー

1. まずインターフェースを定義
2. 失敗するテストを書く（RED）
3. 最小限のコードを実装（GREEN）
4. リファクタリング（IMPROVE）
5. 80%以上のカバレッジを確認
```

### Hooks

hook はツールイベントで発火します。例 - console.log について警告：

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] console.log を削除してください' >&2"
  }]
}
```

### Rules

rule は常に従うガイドラインです。`common/`（言語非依存）+ 言語固有のディレクトリで構成されています：

```
rules/
  common/          # 普遍的な原則（常にインストール）
  typescript/      # TS/JS 固有のパターンとツール
```

詳細は [`rules/README.md`](rules/README.md) を参照してください。

---

## エコシステムツール

### Skill Creator

`/skill-create` コマンドでリポジトリから Claude Code skill を自動生成します：

```bash
/skill-create                    # 現在のリポジトリを分析
/skill-create --instincts        # instinct も同時に生成（continuous-learning 用）
```

git 履歴をローカルで分析し、SKILL.md ファイルを生成します。

### Continuous Learning v2

instinct ベースの学習システムが開発パターンを自動的に学習します：

```bash
/instinct-status        # 学習済み instinct を信頼度付きで表示
/instinct-import <file> # 他の環境から instinct をインポート
/instinct-export        # instinct をエクスポートして共有
/evolve                 # 関連する instinct をクラスタリングして skill 化
```

詳細は `skills/continuous-learning-v2/` を参照してください。

---

## 動作要件

### Claude Code CLI バージョン

**最低バージョン: v2.1.0 以上**

hook の処理方法の変更により、Claude Code CLI v2.1.0 以上が必要です。

```bash
claude --version
```

> **注意:** `.claude-plugin/plugin.json` に `"hooks"` フィールドを追加しないでください。v2.1 以降は `hooks/hooks.json` が自動的に読み込まれるため、重複検出エラーの原因になります。

---

## テストの実行

プラグインには包括的なテストスイートが含まれています：

```bash
# すべてのテストを実行
node tests/run-all.js

# 個別のテストファイルを実行
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## 重要な注意事項

### コンテキストウィンドウ管理

**重要:** すべての MCP を一度に有効にしないでください。有効なツールが多すぎると、200k のコンテキストウィンドウが 70k に縮小する可能性があります。

目安：
- 20-30 の MCP を設定
- プロジェクトごとに 10 個未満を有効化
- アクティブなツールは 80 個未満

プロジェクト設定で `disabledMcpServers` を使用して未使用のものを無効にしてください。

### カスタマイズ

これらの設定は私のワークフロー向けです。あなたは：
1. 共感できるものから始める
2. 自分のスタックに合わせて修正
3. 使わないものは削除
4. 独自のパターンを追加

---

## ライセンス

MIT - 自由に使用し、必要に応じて修正してください。
