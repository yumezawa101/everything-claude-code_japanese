---
name: claude-devfleet
description: Claude DevFleetによるマルチエージェントコーディングタスクのオーケストレーション -- プロジェクトの計画、分離されたworktreeでの並列エージェントのディスパッチ、進捗モニタリング、構造化レポートの読み取り。
origin: community
---

# Claude DevFleet マルチエージェントオーケストレーション

## 使用タイミング

複数のClaude Codeエージェントを並列でコーディングタスクにディスパッチする必要がある場合にこのスキルを使用する。各エージェントは分離されたgit worktreeで完全なツールセットと共に実行される。

MCP経由で接続されたClaude DevFleetインスタンスが必要：
```bash
claude mcp add devfleet --transport http http://localhost:18801/mcp
```

## 仕組み

```
User → "Build a REST API with auth and tests"
  ↓
plan_project(prompt) → project_id + mission DAG
  ↓
Show plan to user → get approval
  ↓
dispatch_mission(M1) → Agent 1 spawns in worktree
  ↓
M1 completes → auto-merge → auto-dispatch M2 (depends_on M1)
  ↓
M2 completes → auto-merge
  ↓
get_report(M2) → files_changed, what_done, errors, next_steps
  ↓
Report back to user
```

### ツール

| ツール | 目的 |
|------|---------|
| `plan_project(prompt)` | AIが説明をチェーンされたミッション付きプロジェクトに分解 |
| `create_project(name, path?, description?)` | プロジェクトを手動作成、`project_id`を返す |
| `create_mission(project_id, title, prompt, depends_on?, auto_dispatch?)` | ミッションを追加。`depends_on`はミッションID文字列のリスト。依存関係が満たされた時に自動開始するには`auto_dispatch=true`を設定。 |
| `dispatch_mission(mission_id, model?, max_turns?)` | ミッションでエージェントを開始 |
| `cancel_mission(mission_id)` | 実行中のエージェントを停止 |
| `wait_for_mission(mission_id, timeout_seconds?)` | ミッション完了までブロック |
| `get_mission_status(mission_id)` | ブロックせずにミッション進捗を確認 |
| `get_report(mission_id)` | 構造化レポートを読む（変更ファイル、テスト済み、エラー、次のステップ） |
| `get_dashboard()` | システム概要：実行中エージェント、統計、最近のアクティビティ |
| `list_projects()` | すべてのプロジェクトを一覧 |
| `list_missions(project_id, status?)` | プロジェクト内のミッションを一覧 |

> **`wait_for_mission`に関する注意:** `timeout_seconds`（デフォルト600）まで会話をブロックする。長時間のミッションでは、進捗更新をユーザーに表示するため、30-60秒ごとに`get_mission_status`でポーリングすることを推奨。

### ワークフロー：計画 → ディスパッチ → モニタリング → レポート

1. **計画**: `plan_project(prompt="...")`を呼び出す → `project_id` + `depends_on`チェーンと`auto_dispatch=true`付きのミッションリストを返す。
2. **計画表示**: ミッションタイトル、タイプ、依存チェーンをユーザーに提示。
3. **ディスパッチ**: ルートミッション（空の`depends_on`）で`dispatch_mission(mission_id=<first_mission_id>)`を呼び出す。残りのミッションは依存関係の完了に伴い自動ディスパッチされる。
4. **モニタリング**: `get_mission_status(mission_id=...)`または`get_dashboard()`で進捗を確認。
5. **レポート**: ミッション完了時に`get_report(mission_id=...)`を呼び出す。ハイライトをユーザーに共有。

### 並行性

DevFleetはデフォルトで最大3つの同時エージェントを実行する（`DEVFLEET_MAX_AGENTS`で設定可能）。すべてのスロットが満杯の場合、`auto_dispatch=true`のミッションはミッションウォッチャーでキューに入り、スロットが空くと自動的にディスパッチされる。

## ガイドライン

- ディスパッチ前に必ずユーザーに計画を確認する（ユーザーが進めてよいと言った場合を除く）。
- ステータス報告時にミッションタイトルとIDを含める。
- ミッションが失敗した場合、リトライ前にレポートを読む。
- 大量ディスパッチ前に`get_dashboard()`でエージェントスロットの空きを確認する。
- ミッション依存関係はDAGを形成する -- 循環依存を作成しない。
- 各エージェントは分離されたgit worktreeで実行され、完了時に自動マージされる。マージコンフリクトが発生した場合、変更はエージェントのworktreeブランチに残り手動解決が必要。
