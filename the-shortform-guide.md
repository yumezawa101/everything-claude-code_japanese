# Everything Claude Code 簡潔ガイド

![Header: Anthropic Hackathon Winner - Tips & Tricks for Claude Code](./assets/images/shortform/00-header.png)

---

**2月のエクスペリメンタルロールアウト以来、熱心な Claude Code ユーザーです。[@DRodriguezFX](https://x.com/DRodriguezFX) と共に [zenith.chat](https://zenith.chat) で Anthropic x Forum Ventures ハッカソンに優勝しました。すべて Claude Code のみで構築。**

10ヶ月間毎日使用した後の完全なセットアップを紹介します: スキル、hooks、サブ agent、MCP、プラグイン、そして実際に効果があったもの。

---

## スキルとコマンド

スキルはルールと似た動作をしますが、特定のスコープとワークフローに限定されます。特定のワークフローを実行する必要があるときのプロンプトの短縮形です。

Opus 4.5 での長いコーディングセッション後にデッドコードと不要な .md ファイルを整理したい場合、`/refactor-clean` を実行。テストが必要なら `/tdd`、`/e2e`、`/test-coverage`。スキルにはコードマップも含められます。Claude がコンテキストを消費せずにコードベースを素早くナビゲートする方法です。

![Terminal showing chained commands](./assets/images/shortform/02-chaining-commands.jpeg)
*コマンドの連鎖実行*

コマンドはスラッシュコマンドで実行されるスキルです。重複していますが、保存場所が異なります:

- **スキル**: `~/.claude/skills/` - より広範なワークフロー定義
- **コマンド**: `~/.claude/commands/` - 即座に実行可能なプロンプト

```bash
# スキル構造の例
~/.claude/skills/
  pmx-guidelines.md      # プロジェクト固有のパターン
  coding-standards.md    # 言語のベストプラクティス
  tdd-workflow/          # 複数ファイルのスキル（README.md付き）
  security-review/       # チェックリストベースのスキル
```

---

## Hooks

Hooks は特定のイベントで発火するトリガーベースの自動化です。スキルとは異なり、ツール呼び出しとライフサイクルイベントに限定されます。

**Hook タイプ:**

1. **PreToolUse** - ツール実行前（バリデーション、リマインダー）
2. **PostToolUse** - ツール完了後（フォーマット、フィードバックループ）
3. **UserPromptSubmit** - メッセージ送信時
4. **Stop** - Claude がレスポンスを完了した時
5. **PreCompact** - コンテキスト圧縮前
6. **Notification** - パーミッションリクエスト

**例: 長時間実行コマンド前の tmux リマインダー**

```json
{
  "PreToolUse": [
    {
      "matcher": "tool == \"Bash\" && tool_input.command matches \"(npm|pnpm|yarn|cargo|pytest)\"",
      "hooks": [
        {
          "type": "command",
          "command": "if [ -z \"$TMUX\" ]; then echo '[Hook] Consider tmux for session persistence' >&2; fi"
        }
      ]
    }
  ]
}
```

![PostToolUse hook feedback](./assets/images/shortform/03-posttooluse-hook.png)
*PostToolUse hook 実行時の Claude Code でのフィードバック例*

**上級テクニック:** `hookify` プラグインを使えば、JSON を手書きする代わりに会話形式で hooks を作成できます。`/hookify` を実行して、やりたいことを説明するだけです。

---

## サブ agent

サブ agent は、オーケストレーター（メインの Claude）が限定されたスコープでタスクを委譲できるプロセスです。バックグラウンドまたはフォアグラウンドで実行でき、メイン agent のコンテキストを解放します。

サブ agent はスキルとうまく連携します。スキルのサブセットを実行できるサブ agent にタスクを委譲し、それらのスキルを自律的に使用させることができます。特定のツールパーミッションでサンドボックス化も可能です。

```bash
# サブ agent 構造の例
~/.claude/agents/
  planner.md           # 機能実装の計画
  architect.md         # システム設計の意思決定
  tdd-guide.md         # テスト駆動開発
  code-reviewer.md     # 品質/セキュリティレビュー
  security-reviewer.md # 脆弱性分析
  build-error-resolver.md
  e2e-runner.md
  refactor-cleaner.md
```

サブ agent ごとに許可するツール、MCP、パーミッションを設定して適切にスコープを定義します。

---

## ルールとメモリ

`.rules` フォルダには、Claude が常に従うべきベストプラクティスの `.md` ファイルが格納されます。2つのアプローチ:

1. **単一の CLAUDE.md** - すべてを1つのファイルに（ユーザーまたはプロジェクトレベル）
2. **ルールフォルダ** - 関心事別にグループ化されたモジュラー `.md` ファイル

```bash
~/.claude/rules/
  security.md      # ハードコードされたシークレット禁止、入力バリデーション
  coding-style.md  # 不変性、ファイル構成
  testing.md       # TDD ワークフロー、80% カバレッジ
  git-workflow.md  # コミット形式、PR プロセス
  agents.md        # サブ agent への委譲タイミング
  performance.md   # モデル選択、コンテキスト管理
```

**ルールの例:**

- コードベースに絵文字を使わない
- フロントエンドで紫系の色を避ける
- デプロイ前に必ずテストする
- メガファイルよりモジュラーなコードを優先
- console.log をコミットしない

---

## MCP (Model Context Protocol)

MCP は Claude を外部サービスに直接接続します。API の代替ではなく、API のプロンプト駆動型ラッパーで、情報のナビゲーションにより柔軟性をもたらします。

**例:** Supabase MCP により、Claude は特定のデータを取得し、コピー&ペーストなしで直接上流に SQL を実行できます。データベース、デプロイプラットフォームなども同様です。

![Supabase MCP listing tables](./assets/images/shortform/04-supabase-mcp.jpeg)
*Supabase MCP が public スキーマ内のテーブルを一覧表示する例*

**Chrome in Claude:** Claude が自律的にブラウザを制御し、動作を確認できるビルトインプラグイン MCP です。

**重要: コンテキストウィンドウ管理**

MCP は厳選してください。すべての MCP をユーザー設定に保持しますが、**未使用のものはすべて無効にします**。`/plugins` に移動してスクロールするか、`/mcp` を実行します。

![/plugins interface](./assets/images/shortform/05-plugins-interface.jpeg)
*/plugins でインストール済み MCP とそのステータスを確認*

圧縮前の 200k コンテキストウィンドウが、有効なツールが多すぎると 70k しか使えないかもしれません。パフォーマンスが大幅に低下します。

**経験則:** 設定に 20-30 の MCP を入れつつ、有効は 10 以下 / アクティブなツールは 80 以下に。

```bash
# 有効な MCP を確認
/mcp

# 未使用のものを無効化（~/.claude.json の projects.disabledMcpServers 内）
```

---

## プラグイン

プラグインは面倒な手動セットアップの代わりに、ツールを簡単にインストールするためにパッケージ化されたものです。プラグインはスキル + MCP の組み合わせや、hooks/ツールのバンドルになり得ます。

**プラグインのインストール:**

```bash
# マーケットプレイスを追加
# @mixedbread-ai による mgrep プラグイン
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep

# Claude を開いて /plugins を実行し、新しいマーケットプレイスを見つけてインストール
```

![Marketplaces tab showing mgrep](./assets/images/shortform/06-marketplaces-mgrep.jpeg)
*新しくインストールした Mixedbread-Grep マーケットプレイスの表示*

**LSP プラグイン** は、エディタの外で Claude Code を頻繁に実行する場合に特に便利です。Language Server Protocol により、IDE を開かなくてもリアルタイムの型チェック、定義へのジャンプ、インテリジェントな補完が可能です。

```bash
# 有効なプラグインの例
typescript-lsp@claude-plugins-official  # TypeScript インテリジェンス
pyright-lsp@claude-plugins-official     # Python 型チェック
hookify@claude-plugins-official         # 会話形式で hooks を作成
mgrep@Mixedbread-Grep                   # ripgrep より優れた検索
```

MCP と同じ注意 - コンテキストウィンドウに気をつけてください。

---

## ヒントとテクニック

### キーボードショートカット

- `Ctrl+U` - 行全体を削除（バックスペース連打より速い）
- `!` - 即座の bash コマンドプレフィックス
- `@` - ファイル検索
- `/` - スラッシュコマンドの開始
- `Shift+Enter` - 複数行入力
- `Tab` - 思考表示の切り替え
- `Esc Esc` - Claude の中断 / コード復元

### 並列ワークフロー

- **Fork** (`/fork`) - 重複しないタスクを並列実行するために会話を分岐（キューイングされたメッセージを連打する代わりに）
- **Git Worktree** - コンフリクトなしに並列 Claude を使用。各 worktree は独立したチェックアウト

```bash
git worktree add ../feature-branch feature-branch
# 各 worktree で個別の Claude インスタンスを実行
```

### 長時間実行コマンド用の tmux

Claude が実行するログ/bash プロセスをストリーミングおよび監視:

<https://github.com/user-attachments/assets/shortform/07-tmux-video.mp4>

```bash
tmux new -s dev
# Claude がここでコマンドを実行、デタッチ/再アタッチ可能
tmux attach -t dev
```

### mgrep > grep

`mgrep` は ripgrep/grep からの大幅な改善です。プラグインマーケットプレイスからインストールし、`/mgrep` スキルを使用。ローカル検索と Web 検索の両方に対応。

```bash
mgrep "function handleSubmit"  # ローカル検索
mgrep --web "Next.js 15 app router changes"  # Web 検索
```

### その他の便利なコマンド

- `/rewind` - 以前の状態に戻る
- `/statusline` - ブランチ、コンテキスト %、todo でカスタマイズ
- `/checkpoints` - ファイルレベルの undo ポイント
- `/compact` - コンテキスト圧縮を手動トリガー

### GitHub Actions CI/CD

GitHub Actions で PR にコードレビューを設定。設定すれば Claude が自動で PR をレビューできます。

![Claude bot approving a PR](./assets/images/shortform/08-github-pr-review.jpeg)
*Claude がバグ修正 PR を承認*

### サンドボックス

リスクのある操作にはサンドボックスモードを使用。Claude は実際のシステムに影響を与えない制限された環境で実行されます。

---

## エディタについて

エディタの選択は Claude Code のワークフローに大きく影響します。Claude Code はどのターミナルからでも動作しますが、優れたエディタと組み合わせることでリアルタイムのファイル追跡、素早いナビゲーション、統合コマンド実行が可能になります。

### Zed（私の推奨）

[Zed](https://zed.dev) を使用しています。Rust 製なので本当に高速。即座に起動し、大規模コードベースもストレスなく処理し、システムリソースをほとんど消費しません。

**Zed + Claude Code が優れた組み合わせである理由:**

- **速度** - Rust ベースのパフォーマンスにより、Claude がファイルを高速編集してもラグなし。エディタが追従
- **Agent パネル統合** - Zed の Claude 統合で、Claude が編集するファイルの変更をリアルタイムで追跡。Claude が参照するファイル間をエディタを離れずにジャンプ
- **CMD+Shift+R コマンドパレット** - カスタムスラッシュコマンド、デバッガ、ビルドスクリプトへの検索可能な UI からのクイックアクセス
- **最小リソース使用量** - 負荷の高い操作中も Claude と RAM/CPU を奪い合わない。Opus 実行時に重要
- **Vim モード** - お好みなら完全な Vim キーバインディング

![Zed Editor with custom commands](./assets/images/shortform/09-zed-editor.jpeg)
*CMD+Shift+R でカスタムコマンドドロップダウンを表示する Zed エディタ。右下にフォローモード（ブルズアイ）を表示。*

**エディタに依存しないヒント:**

1. **画面を分割** - 片側に Claude Code のターミナル、もう片側にエディタ
2. **Ctrl + G** - Zed で Claude が現在作業中のファイルをすぐに開く
3. **自動保存** - 自動保存を有効にして Claude のファイル読み取りを常に最新に
4. **Git 統合** - エディタの Git 機能で Claude の変更をコミット前にレビュー
5. **ファイルウォッチャー** - ほとんどのエディタは変更されたファイルを自動リロード、有効になっているか確認

### VSCode / Cursor

これも良い選択で、Claude Code との相性も良好です。ターミナル形式で使用でき、`\ide` でエディタとの自動同期が有効になり LSP 機能が使えます（プラグインの登場で冗長になりつつあります）。または、エディタにより統合され、マッチする UI を持つ拡張機能を選択できます。

![VS Code Claude Code Extension](./assets/images/shortform/10-vscode-extension.jpeg)
*VS Code 拡張機能は、Claude Code のネイティブグラフィカルインターフェースを IDE に直接統合して提供します。*

---

## 私のセットアップ

### プラグイン

**インストール済み:**（通常、同時に 4-5 個のみ有効にしています）

```markdown
ralph-wiggum@claude-code-plugins       # ループ自動化
frontend-design@claude-code-plugins    # UI/UX パターン
commit-commands@claude-code-plugins    # Git ワークフロー
security-guidance@claude-code-plugins  # セキュリティチェック
pr-review-toolkit@claude-code-plugins  # PR 自動化
typescript-lsp@claude-plugins-official # TS インテリジェンス
hookify@claude-plugins-official        # Hook 作成
code-simplifier@claude-plugins-official
feature-dev@claude-code-plugins
explanatory-output-style@claude-code-plugins
code-review@claude-code-plugins
context7@claude-plugins-official       # ライブドキュメント
pyright-lsp@claude-plugins-official    # Python 型
mgrep@Mixedbread-Grep                  # 高機能検索
```

### MCP サーバー

**設定済み（ユーザーレベル）:**

```json
{
  "github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"] },
  "firecrawl": { "command": "npx", "args": ["-y", "firecrawl-mcp"] },
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_REF"]
  },
  "memory": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory"] },
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  "vercel": { "type": "http", "url": "https://mcp.vercel.com" },
  "railway": { "command": "npx", "args": ["-y", "@railway/mcp-server"] },
  "cloudflare-docs": { "type": "http", "url": "https://docs.mcp.cloudflare.com/mcp" },
  "cloudflare-workers-bindings": {
    "type": "http",
    "url": "https://bindings.mcp.cloudflare.com/mcp"
  },
  "clickhouse": { "type": "http", "url": "https://mcp.clickhouse.cloud/mcp" },
  "AbletonMCP": { "command": "uvx", "args": ["ableton-mcp"] },
  "magic": { "command": "npx", "args": ["-y", "@magicuidesign/mcp@latest"] }
}
```

ポイントは、14 の MCP を設定しつつプロジェクトごとに約 5-6 個のみ有効にしていること。コンテキストウィンドウを健全に保ちます。

### 主要 Hooks

```json
{
  "PreToolUse": [
    { "matcher": "npm|pnpm|yarn|cargo|pytest", "hooks": ["tmux リマインダー"] },
    { "matcher": "Write && .md ファイル", "hooks": ["README/CLAUDE 以外はブロック"] },
    { "matcher": "git push", "hooks": ["レビュー用にエディタを開く"] }
  ],
  "PostToolUse": [
    { "matcher": "Edit && .ts/.tsx/.js/.jsx", "hooks": ["prettier --write"] },
    { "matcher": "Edit && .ts/.tsx", "hooks": ["tsc --noEmit"] },
    { "matcher": "Edit", "hooks": ["grep console.log 警告"] }
  ],
  "Stop": [
    { "matcher": "*", "hooks": ["変更ファイルの console.log チェック"] }
  ]
}
```

### カスタムステータスライン

ユーザー、ディレクトリ、ダーティインジケータ付き git ブランチ、残りコンテキスト %、モデル、時刻、todo 数を表示:

![Custom status line](./assets/images/shortform/11-statusline.jpeg)
*Mac ルートディレクトリでのステータスライン例*

```
affoon:~ ctx:65% Opus 4.5 19:52
▌▌ plan mode on (shift+tab to cycle)
```

### ルール構造

```
~/.claude/rules/
  security.md      # 必須セキュリティチェック
  coding-style.md  # 不変性、ファイルサイズ制限
  testing.md       # TDD、80% カバレッジ
  git-workflow.md  # Conventional Commits
  agents.md        # サブ agent 委譲ルール
  patterns.md      # API レスポンス形式
  performance.md   # モデル選択（Haiku vs Sonnet vs Opus）
  hooks.md         # Hook ドキュメント
```

### サブ agent

```
~/.claude/agents/
  planner.md           # 機能の分解
  architect.md         # システム設計
  tdd-guide.md         # テストを先に書く
  code-reviewer.md     # 品質レビュー
  security-reviewer.md # 脆弱性スキャン
  build-error-resolver.md
  e2e-runner.md        # Playwright テスト
  refactor-cleaner.md  # デッドコード除去
  doc-updater.md       # ドキュメント同期
```

---

## 主なポイント

1. **複雑にしすぎない** - 設定はアーキテクチャではなくファインチューニングのように扱う
2. **コンテキストウィンドウは貴重** - 未使用の MCP とプラグインを無効化
3. **並列実行** - 会話を分岐、git worktree を活用
4. **繰り返し作業を自動化** - フォーマット、リンティング、リマインダーに hooks を使用
5. **サブ agent のスコープを限定** - 限定されたツール = 集中した実行

---

## 参考資料

- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Hooks Documentation](https://code.claude.com/docs/en/hooks)
- [Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Interactive Mode](https://code.claude.com/docs/en/interactive-mode)
- [Memory System](https://code.claude.com/docs/en/memory)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [MCP Overview](https://code.claude.com/docs/en/mcp-overview)

---

**注意:** これは詳細の一部です。高度なパターンについては[ロングフォームガイド](./the-longform-guide.md)を参照してください。

---

*NYC で [@DRodriguezFX](https://x.com/DRodriguezFX) と共に [zenith.chat](https://zenith.chat) を構築し、Anthropic x Forum Ventures ハッカソンに優勝*
