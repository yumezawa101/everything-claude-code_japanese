# トークン最適化ガイド

トークン消費を削減し、セッション品質を延長し、1日の上限内でより多くの作業を完了するための実践的な設定と習慣です。

> 参照: モデル選択戦略は `rules/common/performance.md`、自動コンパクション提案は `skills/strategic-compact/` を参照。

---

## 推奨設定

ほとんどのユーザーに推奨されるデフォルト設定です。パワーユーザーはワークロードに応じてさらに値を調整できます。例えば、単純なタスクでは `MAX_THINKING_TOKENS` を低く、複雑なアーキテクチャ作業では高く設定できます。

`~/.claude/settings.json` に追加:

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku"
  }
}
```

### 各設定の効果

| 設定 | デフォルト | 推奨値 | 効果 |
|---------|---------|-------------|--------|
| `model` | opus | **sonnet** | Sonnet はコーディングタスクの約80%を適切に処理。複雑な推論には `/model opus` で切り替え。コスト約60%削減。 |
| `MAX_THINKING_TOKENS` | 31,999 | **10,000** | Extended thinking はリクエストごとに最大 31,999 出力トークンを内部推論用に予約。これを削減すると隠れたコストを約70%削減。些細なタスクでは `0` に設定して無効化。 |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | 自動コンパクションはコンテキストがこの容量%に達した時にトリガー。デフォルトの95%では遅すぎ、それ以前に品質が劣化。50%でコンパクションすればセッションがより健全に。 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | _（メインを継承）_ | **haiku** | サブエージェント（Task ツール）はこのモデルで実行。Haiku は約80%安価で、探索、ファイル読み取り、テスト実行には十分。 |

### Extended thinking の切り替え

- **Alt+T**（Windows/Linux）または **Option+T**（macOS） -- オン/オフ切り替え
- **Ctrl+O** -- thinking 出力の表示（詳細モード）

---

## モデル選択

タスクに適したモデルを使用:

| モデル | 最適な用途 | コスト |
|-------|----------|------|
| **Haiku** | サブエージェント探索、ファイル読み取り、簡単な検索 | 最低 |
| **Sonnet** | 日常のコーディング、レビュー、テスト作成、実装 | 中程度 |
| **Opus** | 複雑なアーキテクチャ、マルチステップ推論、微妙な問題のデバッグ | 最高 |

セッション中にモデルを切り替え:

```
/model sonnet     # default for most work
/model opus       # complex reasoning
/model haiku      # quick lookups
```

---

## コンテキスト管理

### コマンド

| コマンド | 使用タイミング |
|---------|-------------|
| `/clear` | 無関係なタスク間。古いコンテキストは後続のすべてのメッセージでトークンを浪費。 |
| `/compact` | 論理的なタスクの区切り（計画後、デバッグ後、フォーカス切り替え前）。 |
| `/cost` | 現在のセッションのトークン消費を確認。 |

### 戦略的コンパクション

`strategic-compact` スキル（`skills/strategic-compact/` 内）は、タスク途中でトリガーされる可能性のある自動コンパクションに頼るのではなく、論理的な間隔で `/compact` を提案します。hook セットアップ手順はスキルの README を参照してください。

**コンパクションすべきタイミング:**
- 探索後、実装前
- マイルストーン完了後
- デバッグ後、新しい作業に進む前
- 大きなコンテキスト切り替え前

**コンパクションすべきでないタイミング:**
- 関連する変更の実装中
- アクティブな問題のデバッグ中
- 複数ファイルにまたがるリファクタリング中

### サブエージェントでコンテキストを保護

メインセッションで多くのファイルを読む代わりに、探索にはサブエージェント（Task ツール）を使用してください。サブエージェントが20ファイルを読んでも、返すのはサマリーだけ -- メインコンテキストはクリーンに保たれます。

---

## MCP サーバー管理

有効な各 MCP サーバーはコンテキストウィンドウにツール定義を追加します。README は警告しています: **プロジェクトあたり10個以下の有効化を推奨**。

ヒント:
- `/mcp` を実行してアクティブなサーバーとそのコンテキストコストを確認
- 利用可能な場合は CLI ツールを優先（GitHub MCP の代わりに `gh`、AWS MCP の代わりに `aws`）
- プロジェクト設定の `disabledMcpServers` でプロジェクトごとにサーバーを無効化
- `memory` MCP サーバーはデフォルトで設定されているが、どのスキル、agent、hook でも使用されていない -- 無効化を検討

---

## Agent Teams のコスト警告

[Agent Teams](https://code.claude.com/docs/en/agent-teams)（実験的機能）は複数の独立したコンテキストウィンドウを生成します。各チームメイトが個別にトークンを消費します。

- 並列処理が明確な価値をもたらすタスク（マルチモジュール作業、並列レビュー）にのみ使用
- 単純な逐次タスクには、サブエージェント（Task ツール）の方がトークン効率が良い
- 有効化: 設定に `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` を追加

---

## 将来: configure-ecc 統合

`configure-ecc` インストールウィザードがセットアップ時にこれらの環境変数をコストトレードオフの説明付きで設定できるようになる可能性があります。これにより、新しいユーザーが上限に達してから設定を発見するのではなく、初日から最適化できるようになります。

---

## クイックリファレンス

```bash
# Daily workflow
/model sonnet              # Start here
/model opus                # Only for complex reasoning
/clear                     # Between unrelated tasks
/compact                   # At logical breakpoints
/cost                      # Check spending

# Environment variables (add to ~/.claude/settings.json "env" block)
MAX_THINKING_TOKENS=10000
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50
CLAUDE_CODE_SUBAGENT_MODEL=haiku
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```
