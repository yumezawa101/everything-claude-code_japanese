---
description: Claude DevFleet を通じて並列の Claude Code エージェントをオーケストレーション。自然言語からプロジェクトを計画し、分離されたワークツリーでエージェントをディスパッチし、進捗を監視し、構造化レポートを取得します。
---

# DevFleet -- マルチエージェントオーケストレーション

Claude DevFleet を通じて並列の Claude Code エージェントをオーケストレーションします。各エージェントは完全なツール環境を備えた分離された git ワークツリーで実行されます。

DevFleet MCP サーバーが必要: `claude mcp add devfleet --transport http http://localhost:18801/mcp`

## フロー

```
ユーザーがプロジェクトを説明
  → plan_project(prompt) → 依存関係付きのミッション DAG
  → プランを表示し承認を取得
  → dispatch_mission(M1) → エージェントがワークツリーで起動
  → M1 完了 → 自動マージ → M2 が自動ディスパッチ（M1 に依存）
  → M2 完了 → 自動マージ
  → get_report(M2) → files_changed, what_done, errors, next_steps
  → ユーザーにサマリーを報告
```

## ワークフロー

1. **プロジェクトを計画** -- ユーザーの説明から:

```
mcp__devfleet__plan_project(prompt="<ユーザーの説明>")
```

これにより連鎖されたミッションを持つプロジェクトが返されます。以下をユーザーに表示:
- プロジェクト名と ID
- 各ミッション: タイトル、タイプ、依存関係
- 依存関係 DAG（どのミッションがどれをブロックするか）

2. **ディスパッチ前にユーザーの承認を待つ**。プランを明確に表示する。

3. **最初のミッションをディスパッチ**（`depends_on` が空のもの）:

```
mcp__devfleet__dispatch_mission(mission_id="<first_mission_id>")
```

残りのミッションは依存関係が完了すると自動ディスパッチされます（`plan_project` が `auto_dispatch=true` で作成するため）。`create_mission` で手動作成する場合は、明示的に `auto_dispatch=true` を設定する必要があります。

4. **進捗を監視** -- 実行中のものを確認:

```
mcp__devfleet__get_dashboard()
```

または特定のミッションを確認:

```
mcp__devfleet__get_mission_status(mission_id="<id>")
```

長時間実行ミッションでは `wait_for_mission` より `get_mission_status` でのポーリングを推奨。ユーザーに進捗更新を表示できます。

5. **レポートを取得** -- 完了した各ミッションについて:

```
mcp__devfleet__get_report(mission_id="<mission_id>")
```

ターミナル状態に達したすべてのミッションで呼び出します。レポートには files_changed、what_done、what_open、what_tested、what_untested、next_steps、errors_encountered が含まれます。

## 利用可能なツール一覧

| ツール | 目的 |
|------|---------|
| `plan_project(prompt)` | AI が説明を `auto_dispatch=true` の連鎖ミッションに分解 |
| `create_project(name, path?, description?)` | プロジェクトを手動作成、`project_id` を返す |
| `create_mission(project_id, title, prompt, depends_on?, auto_dispatch?)` | ミッションを追加。`depends_on` はミッション ID 文字列のリスト |
| `dispatch_mission(mission_id, model?, max_turns?)` | エージェントを起動 |
| `cancel_mission(mission_id)` | 実行中のエージェントを停止 |
| `wait_for_mission(mission_id, timeout_seconds?)` | 完了までブロック（長時間タスクにはポーリング推奨） |
| `get_mission_status(mission_id)` | ブロックせずに進捗を確認 |
| `get_report(mission_id)` | 構造化レポートを取得 |
| `get_dashboard()` | システム概要 |
| `list_projects()` | プロジェクトを閲覧 |
| `list_missions(project_id, status?)` | ミッションを一覧表示 |

## ガイドライン

- ユーザーが「進めて」と言っていない限り、ディスパッチ前に必ずプランを確認
- ステータス報告時にミッションのタイトルと ID を含める
- ミッションが失敗した場合、リトライ前にレポートを読んでエラーを理解する
- エージェント並行数は設定可能（デフォルト: 3）。超過ミッションはキューに入り、スロットが空くと自動ディスパッチ。`get_dashboard()` でスロットの空き状況を確認
- 依存関係は DAG を形成 -- 循環依存を作成しないこと
- 各エージェントは完了時にワークツリーを自動マージ。マージコンフリクトが発生した場合、変更はワークツリーブランチに残り手動解決が必要
