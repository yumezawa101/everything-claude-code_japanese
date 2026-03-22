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

## ガイド

このリポジトリには、原始コードのみが含まれています。ガイドがすべてを説明しています。

<table>
<tr>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2012378465664745795">
<img src="https://github.com/user-attachments/assets/1a471488-59cc-425b-8345-5245c7efbcef" alt="The Shorthand Guide to Everything Claude Code" />
</a>
</td>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2014040193557471352">
<img src="https://github.com/user-attachments/assets/c9ca43bc-b149-427f-b551-af6840c368f0" alt="The Longform Guide to Everything Claude Code" />
</a>
</td>
</tr>
<tr>
<td align="center"><b>簡潔ガイド</b><br/>セットアップ、基礎、哲学。<b>まずこれを読んでください。</b></td>
<td align="center"><b>長文ガイド</b><br/>トークン最適化、メモリ永続化、評価、並列化。</td>
</tr>
</table>

| トピック | 学べる内容 |
|-------|-------------------|
| トークン最適化 | モデル選択、システムプロンプト削減、バックグラウンドプロセス |
| メモリ永続化 | セッション間でコンテキストを自動保存/読み込みするフック |
| 継続的学習 | セッションからパターンを自動抽出して再利用可能なスキルに変換 |
| 検証ループ | チェックポイントと継続的評価、スコアラータイプ、pass@k メトリクス |
| 並列化 | Git ワークツリー、カスケード方法、スケーリング時期 |
| サブエージェント オーケストレーション | コンテキスト問題、反復検索パターン |

---

## 新機能

### v2.0.0 — upstream v1.9.0 同期 + 全面日本語化（2026年3月）

- **upstream 661コミット分を統合** — v1.2.0 から v1.9.0 までの全変更を取り込み
- **全コンテンツの日本語化** — 28 エージェント、59 コマンド、116 スキルを日本語翻訳
- **12言語サポート** — TypeScript, Python, Go, Java, Rust, C++, Kotlin, Swift, PHP, Perl, C# のルールを収録
- **新規エージェント** — chief-of-staff, docs-lookup, harness-optimizer, loop-operator, typescript-reviewer 等を追加
- **plugin version 2.0.0** — claudecode-tool-ja として再構成

### v1.4.1 — バグ修正（2026年2月）

- **instinctインポート時のコンテンツ喪失を修正** — `/instinct-import`実行時に`parse_instinct_file()`がfrontmatter後のすべてのコンテンツを暗黙的に削除していた問題を修正（[#148](https://github.com/affaan-m/everything-claude-code/issues/148), [#161](https://github.com/affaan-m/everything-claude-code/pull/161)）

### v1.4.0 — マルチ言語ルール、インストールウィザード & PM2（2026年2月）

- **インタラクティブインストールウィザード** — 新しい`configure-ecc`スキルがマージ/上書き検出付きガイドセットアップを提供
- **PM2 & マルチエージェントオーケストレーション** — 複雑なマルチサービスワークフロー管理用の6つの新コマンド
- **マルチ言語ルールアーキテクチャ** — ルールを`common/` + 言語固有ディレクトリに再構成

### v1.3.0 — OpenCodeプラグイン対応（2026年2月）

- **フルOpenCode統合** — 12エージェント、24コマンド、16スキル
- **3つのネイティブカスタムツール** — run-tests、check-coverage、security-audit

### v1.2.0 — 統合コマンド & スキル（2026年2月）

- **Python/Djangoサポート** — Djangoパターン、セキュリティ、TDD、検証スキル
- **Java Spring Bootスキル** — Spring Boot用パターン、セキュリティ、TDD、検証
- **継続的学習 v2** — 信頼度スコアリング、インポート/エクスポート、進化を伴うinstinctベースの学習

完全なチェンジログは[upstream Releases](https://github.com/affaan-m/everything-claude-code/releases)を参照してください。

---

## クイックスタート

2分以内に起動できます:

### ステップ 1: プラグインをインストール

```bash
# マーケットプレイスを追加
/plugin marketplace add yumezawa101/everything-claude-code_japanese

# プラグインをインストール
/plugin install claudecode-tool-ja@claudecode-tool-ja
```

### ステップ 2: ルールをインストール（必須）

> **重要:** Claude Codeプラグインは`rules`を自動配布できません。手動でインストールしてください:

```bash
# まずリポジトリをクローン
git clone https://github.com/yumezawa101/everything-claude-code_japanese.git

# 共通ルールをインストール（必須）
cp -r everything-claude-code_japanese/rules/common/* ~/.claude/rules/

# 言語固有ルールをインストール（スタックを選択）
cp -r everything-claude-code_japanese/rules/typescript/* ~/.claude/rules/
cp -r everything-claude-code_japanese/rules/python/* ~/.claude/rules/
cp -r everything-claude-code_japanese/rules/golang/* ~/.claude/rules/
```

### ステップ 3: 使用開始

```bash
# コマンドを試す
/claudecode-tool-ja:plan "ユーザー認証を追加"

# 利用可能なコマンドを確認
/plugin list claudecode-tool-ja@claudecode-tool-ja
```

**完了です!** これで28のエージェント、116のスキル、59のコマンドにアクセスできます。

---

## クロスプラットフォーム対応

このプラグインは **Windows、macOS、Linux** を完全にサポートしています。すべてのフックとスクリプトが Node.js で書き直され、最大の互換性を実現しています。

### パッケージマネージャー検出

プラグインは、以下の優先順位で、お好みのパッケージマネージャー（npm、pnpm、yarn、bun）を自動検出します:

1. **環境変数**: `CLAUDE_PACKAGE_MANAGER`
2. **プロジェクト設定**: `.claude/package-manager.json`
3. **package.json**: `packageManager` フィールド
4. **ロックファイル**: package-lock.json、yarn.lock、pnpm-lock.yaml、bun.lockb から検出
5. **グローバル設定**: `~/.claude/package-manager.json`
6. **フォールバック**: 最初に利用可能なパッケージマネージャー

```bash
# 環境変数経由
export CLAUDE_PACKAGE_MANAGER=pnpm

# グローバル設定経由
node scripts/setup-package-manager.js --global pnpm

# 現在の設定を検出
node scripts/setup-package-manager.js --detect
```

または Claude Code で `/setup-pm` コマンドを使用。

---

## 含まれるもの

このリポジトリは**Claude Codeプラグイン**です - 直接インストールするか、コンポーネントを手動でコピーできます。

```
claudecode-tool-ja/
|-- .claude-plugin/   # プラグインとマーケットプレイスマニフェスト
|   |-- plugin.json         # プラグインメタデータとコンポーネントパス
|   |-- marketplace.json    # /plugin marketplace add 用のマーケットプレイスカタログ
|
|-- agents/           # 委任用の専門サブエージェント（28種類）
|   |-- planner.md           # 機能実装計画
|   |-- architect.md         # システム設計決定
|   |-- tdd-guide.md         # テスト駆動開発
|   |-- code-reviewer.md     # 品質とセキュリティレビュー
|   |-- security-reviewer.md # 脆弱性分析
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2E テスト
|   |-- refactor-cleaner.md  # デッドコード削除
|   |-- doc-updater.md       # ドキュメント同期
|   |-- database-reviewer.md # データベース/Supabase レビュー
|   |-- chief-of-staff.md    # タスク管理・委任
|   |-- typescript-reviewer.md # TypeScript コードレビュー
|   |-- python-reviewer.md   # Python コードレビュー
|   |-- go-reviewer.md       # Go コードレビュー
|   |-- ...他 14 エージェント（各言語 build-resolver 等）
|
|-- skills/           # ワークフロー定義と領域知識（116種類）
|   |-- coding-standards/           # 言語ベストプラクティス
|   |-- backend-patterns/           # API、データベース、キャッシュパターン
|   |-- frontend-patterns/          # React、Next.js パターン
|   |-- tdd-workflow/               # TDD 方法論
|   |-- security-review/            # セキュリティチェックリスト
|   |-- continuous-learning-v2/     # instinct ベース学習
|   |-- docker-patterns/            # Docker/コンテナパターン
|   |-- mcp-server-patterns/        # MCP サーバー構築
|   |-- api-design/                 # API 設計パターン
|   |-- ...他 107 スキル
|
|-- commands/         # スラッシュコマンド（59種類）
|   |-- tdd.md              # /tdd - テスト駆動開発
|   |-- plan.md             # /plan - 実装計画
|   |-- e2e.md              # /e2e - E2E テスト生成
|   |-- code-review.md      # /code-review - 品質レビュー
|   |-- build-fix.md        # /build-fix - ビルドエラー修正
|   |-- ...他 54 コマンド
|
|-- rules/            # 常に従うべきガイドライン（~/.claude/rules/ にコピー）
|   |-- README.md            # 構造概要とインストールガイド
|   |-- common/              # 言語非依存の原則
|   |-- typescript/          # TypeScript/JavaScript 固有
|   |-- python/              # Python 固有
|   |-- golang/              # Go 固有
|   |-- java/                # Java 固有
|   |-- kotlin/              # Kotlin 固有
|   |-- rust/                # Rust 固有
|   |-- cpp/                 # C++ 固有
|   |-- swift/               # Swift 固有
|   |-- php/                 # PHP 固有
|   |-- perl/                # Perl 固有
|   |-- csharp/              # C# 固有
|
|-- hooks/            # トリガーベースの自動化
|   |-- hooks.json                # すべてのフック設定
|
|-- scripts/          # クロスプラットフォーム Node.js スクリプト
|-- tests/            # テストスイート
|-- contexts/         # 動的システムプロンプト注入コンテキスト
|-- examples/         # 設定例とセッション
|-- mcp-configs/      # MCP サーバー設定
|-- docs/ja-JP/       # upstream 日本語翻訳（参考資料）
```

---

## エコシステムツール

### スキル作成ツール

リポジトリから Claude Code スキルを生成する 2 つの方法:

#### オプション A: ローカル分析（ビルトイン）

```bash
/skill-create                    # 現在のリポジトリを分析
/skill-create --instincts        # 継続的学習用の直感も生成
```

#### オプション B: GitHub アプリ（高度な機能）

[GitHub アプリをインストール](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

### AgentShield -- セキュリティ監査ツール

Claude Code 設定の脆弱性、誤設定、インジェクションリスクをスキャンします。

```bash
npx ecc-agentshield scan          # クイックスキャン
npx ecc-agentshield scan --fix    # 安全な問題を自動修正
npx ecc-agentshield scan --opus --stream  # 深い分析
```

### 継続的学習 v2

instinctベースの学習システムがパターンを自動学習:

```bash
/instinct-status        # 信頼度付きで学習したinstinctを表示
/instinct-import <file> # 他者のinstinctをインポート
/instinct-export        # instinctをエクスポートして共有
/evolve                 # 関連するinstinctをスキルにクラスタリング
```

---

## 要件

### Claude Code CLI バージョン

**最小バージョン: v2.1.0 以上**

```bash
claude --version
```

### 重要: フック自動読み込み動作

> **貢献者向け:** `.claude-plugin/plugin.json`に`"hooks"`フィールドを追加しないでください。

Claude Code v2.1+は、インストール済みプラグインの`hooks/hooks.json`を自動読み込みします。`plugin.json`で明示的に宣言するとエラーが発生します。

---

## インストール

### オプション 1: プラグインとしてインストール（推奨）

```bash
# このリポジトリをマーケットプレイスとして追加
/plugin marketplace add yumezawa101/everything-claude-code_japanese

# プラグインをインストール
/plugin install claudecode-tool-ja@claudecode-tool-ja
```

または、`~/.claude/settings.json` に直接追加:

```json
{
  "extraKnownMarketplaces": {
    "claudecode-tool-ja": {
      "source": {
        "source": "github",
        "repo": "yumezawa101/everything-claude-code_japanese"
      }
    }
  },
  "enabledPlugins": {
    "claudecode-tool-ja@claudecode-tool-ja": true
  }
}
```

> **注:** ルールは手動でインストールする必要があります:
>
> ```bash
> git clone https://github.com/yumezawa101/everything-claude-code_japanese.git
> cp -r everything-claude-code_japanese/rules/common/* ~/.claude/rules/
> cp -r everything-claude-code_japanese/rules/typescript/* ~/.claude/rules/   # スタックを選択
> ```

---

### オプション 2: 手動インストール

```bash
git clone https://github.com/yumezawa101/everything-claude-code_japanese.git
cd everything-claude-code_japanese

# エージェントをコピー
cp everything-claude-code_japanese/agents/*.md ~/.claude/agents/

# ルール（共通 + 言語固有）をコピー
cp -r everything-claude-code_japanese/rules/common/* ~/.claude/rules/
cp -r everything-claude-code_japanese/rules/typescript/* ~/.claude/rules/   # スタックを選択

# コマンドをコピー
cp everything-claude-code_japanese/commands/*.md ~/.claude/commands/

# スキルをコピー
cp -r everything-claude-code_japanese/skills/* ~/.claude/skills/
```

#### settings.json にフックを追加

`hooks/hooks.json` のフックを `~/.claude/settings.json` にコピーします。

#### MCP を設定

`mcp-configs/mcp-servers.json` から必要な MCP サーバーを `~/.claude.json` にコピーします。

**重要:** `YOUR_*_HERE`プレースホルダーを実際のAPIキーに置き換えてください。

---

## 主要概念

### エージェント

サブエージェントは限定的な範囲のタスクを処理します:

```markdown
---
name: code-reviewer
description: コードの品質、セキュリティ、保守性をレビュー
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

あなたは経験豊富なコードレビュアーです...
```

### スキル

スキルはコマンドまたはエージェントによって呼び出されるワークフロー定義:

```markdown
# TDD ワークフロー

1. インターフェースを最初に定義
2. テストを失敗させる (RED)
3. 最小限のコードを実装 (GREEN)
4. リファクタリング (IMPROVE)
5. 80%+ のカバレッジを確認
```

### フック

フックはツールイベントでトリガーされます:

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

### ルール

ルールは常に従うべきガイドラインで、`common/`（言語非依存）+ 言語固有ディレクトリに組織化:

```
rules/
  common/          # 普遍的な原則（常にインストール）
  typescript/      # TS/JS 固有
  python/          # Python 固有
  golang/          # Go 固有
  java/            # Java 固有
  ...              # その他 8 言語
```

インストールと構造の詳細は[`rules/README.md`](rules/README.md)を参照してください。

---

## テストを実行

```bash
# すべてのテストを実行
node tests/run-all.js

# 個別のテストファイルを実行
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## 貢献

貢献は upstream リポジトリ [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) で受け付けています。詳細は upstream の [CONTRIBUTING.md](https://github.com/affaan-m/everything-claude-code/blob/main/CONTRIBUTING.md) を参照してください。

---

## 背景

実験的なリリース以来、Claude Codeを使用してきました。2025年9月、[@DRodriguezFX](https://x.com/DRodriguezFX)と一緒にClaude Codeで[zenith.chat](https://zenith.chat)を構築し、Anthropic x Forum Venturesハッカソンで優勝しました。

これらの設定は複数の本番環境アプリケーションで実戦テストされています。

---

## 重要な注記

### コンテキストウィンドウ管理

**重要:** すべてのMCPを一度に有効にしないでください。多くのツールを有効にすると、200kのコンテキストウィンドウが70kに縮小される可能性があります。

経験則:
- 20-30のMCPを設定
- プロジェクトごとに10未満を有効にしたままにしておく
- アクティブなツール80未満

### カスタマイズ

これらの設定は参考用です。以下を行うべきです:
1. 共感できる部分から始める
2. 技術スタックに合わせて修正
3. 使用しない部分を削除
4. 独自のパターンを追加

---

## Star 履歴

[![Star History Chart](https://api.star-history.com/svg?repos=affaan-m/everything-claude-code&type=Date)](https://star-history.com/#affaan-m/everything-claude-code&Date)

---

## リンク

- **簡潔ガイド（まずはこれ）:** [Everything Claude Code 簡潔ガイド](https://x.com/affaanmustafa/status/2012378465664745795)
- **詳細ガイド（高度）:** [Everything Claude Code 詳細ガイド](https://x.com/affaanmustafa/status/2014040193557471352)
- **upstream:** [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- **このフォーク:** [yumezawa101/everything-claude-code_japanese](https://github.com/yumezawa101/everything-claude-code_japanese)

---

## ライセンス

MIT - 自由に使用、必要に応じて修正、可能であれば貢献してください。

---

**このリポジトリが役に立ったら、Star を付けてください。ガイドを読んでください。素晴らしいものを構築してください。**
