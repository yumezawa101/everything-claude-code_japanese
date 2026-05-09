# Harness Audit コマンド

決定論的なリポジトリハーネス監査を実行し、優先順位付きのスコアカードを返します。

## 使用方法

`/harness-audit [scope] [--format text|json]`

- `scope`（オプション）: `repo`（デフォルト）、`hooks`、`skills`、`commands`、`agents`
- `--format`: 出力形式（デフォルト `text`、自動化用に `json`）

## 決定論的エンジン

常に以下を実行:

```bash
node scripts/harness-audit.js <scope> --format <text|json>
```

このスクリプトがスコアリングとチェックの信頼できるソースです。追加のディメンションやアドホックポイントを独自に作成しないでください。

ルーブリックバージョン: `2026-03-16`

スクリプトは7つの固定カテゴリ（各 `0-10` に正規化）を計算:

1. Tool Coverage
2. Context Efficiency
3. Quality Gates
4. Memory Persistence
5. Eval Coverage
6. Security Guardrails
7. Cost Efficiency

スコアは明示的なファイル/ルールチェックから導出され、同一コミットで再現可能です。

## 出力仕様

返却内容:

1. `overall_score` / `max_score`（`repo` の場合70、スコープ監査ではより小さい値）
2. カテゴリスコアと具体的な検出結果
3. 失敗したチェックと正確なファイルパス
4. 決定論的出力からのトップ3アクション（`top_actions`）
5. 次に適用すべき推奨 ECC スキル

## チェックリスト

- スクリプト出力を直接使用し、手動でスコアを付け直さない
- `--format json` がリクエストされた場合、スクリプトの JSON をそのまま返す
- text がリクエストされた場合、失敗したチェックとトップアクションを要約
- `checks[]` と `top_actions[]` からの正確なファイルパスを含める

## 出力例

```text
Harness Audit (repo): 66/70
- Tool Coverage: 10/10 (10/10 pts)
- Context Efficiency: 9/10 (9/10 pts)
- Quality Gates: 10/10 (10/10 pts)

Top 3 Actions:
1) [Security Guardrails] Add prompt/tool preflight security guards in hooks/hooks.json. (hooks/hooks.json)
2) [Tool Coverage] Sync commands/harness-audit.md and .opencode/commands/harness-audit.md. (.opencode/commands/harness-audit.md)
3) [Eval Coverage] Increase automated test coverage across scripts/hooks/lib. (tests/)
```

## 引数

$ARGUMENTS:
- `repo|hooks|skills|commands|agents`（オプションのスコープ）
- `--format text|json`（オプションの出力形式）
