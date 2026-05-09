---
name: agent-eval
description: コーディングエージェント（Claude Code、Aider、Codexなど）をカスタムタスクで直接比較し、パス率、コスト、時間、一貫性の指標を測定する
origin: ECC
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Agent Eval スキル

コーディングエージェントを再現可能なタスクで直接比較するための軽量CLIツール。「どのコーディングエージェントが最適か？」という比較はすべて主観的に行われがちだが、このツールはそれを体系化する。

## 発動条件

- コーディングエージェント（Claude Code、Aider、Codexなど）を自分のコードベースで比較する場合
- 新しいツールやモデルを導入する前にエージェントの性能を測定する場合
- エージェントがモデルやツールを更新した際にリグレッションチェックを実行する場合
- チームのためにデータに基づいたエージェント選定を行う場合

## インストール

> **注意:** agent-evalはソースを確認した上で、そのリポジトリからインストールしてください。

## コアコンセプト

### YAMLタスク定義

タスクを宣言的に定義する。各タスクは実行内容、対象ファイル、成功判定基準を指定する：

```yaml
name: add-retry-logic
description: Add exponential backoff retry to the HTTP client
repo: ./my-project
files:
  - src/http_client.py
prompt: |
  Add retry logic with exponential backoff to all HTTP requests.
  Max 3 retries. Initial delay 1s, max delay 30s.
judge:
  - type: pytest
    command: pytest tests/test_http_client.py -v
  - type: grep
    pattern: "exponential_backoff|retry"
    files: src/http_client.py
commit: "abc1234"  # pin to specific commit for reproducibility
```

### Git Worktreeによる分離

各エージェント実行は独自のgit worktreeを取得する — Dockerは不要。これにより再現性の分離が実現され、エージェント同士が干渉したりベースリポジトリを破壊することがない。

### 収集される指標

| 指標 | 測定内容 |
|--------|-----------------|
| パス率 | エージェントが判定を通過するコードを生成したか |
| コスト | タスクごとのAPI費用（取得可能な場合） |
| 時間 | 完了までの実測時間（秒） |
| 一貫性 | 複数回実行でのパス率（例：3/3 = 100%） |

## ワークフロー

### 1. タスクを定義する

`tasks/`ディレクトリにYAMLファイルを作成する（タスクごとに1ファイル）：

```bash
mkdir tasks
# Write task definitions (see template above)
```

### 2. エージェントを実行する

タスクに対してエージェントを実行する：

```bash
agent-eval run --task tasks/add-retry-logic.yaml --agent claude-code --agent aider --runs 3
```

各実行の流れ：
1. 指定されたcommitからフレッシュなgit worktreeを作成
2. エージェントにプロンプトを渡す
3. 判定基準を実行する
4. 合否、コスト、時間を記録する

### 3. 結果を比較する

比較レポートを生成する：

```bash
agent-eval report --format table
```

```
Task: add-retry-logic (3 runs each)
┌──────────────┬───────────┬────────┬────────┬─────────────┐
│ Agent        │ Pass Rate │ Cost   │ Time   │ Consistency │
├──────────────┼───────────┼────────┼────────┼─────────────┤
│ claude-code  │ 3/3       │ $0.12  │ 45s    │ 100%        │
│ aider        │ 2/3       │ $0.08  │ 38s    │  67%        │
└──────────────┴───────────┴────────┴────────┴─────────────┘
```

## 判定タイプ

### コードベース（決定論的）

```yaml
judge:
  - type: pytest
    command: pytest tests/ -v
  - type: command
    command: npm run build
```

### パターンベース

```yaml
judge:
  - type: grep
    pattern: "class.*Retry"
    files: src/**/*.py
```

### モデルベース（LLM-as-judge）

```yaml
judge:
  - type: llm
    prompt: |
      Does this implementation correctly handle exponential backoff?
      Check for: max retries, increasing delays, jitter.
```

## ベストプラクティス

- **実際のワークロードを代表する3-5タスクから始める** — トイの例ではなく
- **エージェントごとに少なくとも3回試行する** — エージェントは非決定論的であるため分散を捕捉する
- **タスクYAMLでcommitを固定する** — 数日/数週間にわたって結果を再現可能にする
- **タスクごとに少なくとも1つの決定論的判定（テスト、ビルド）を含める** — LLM判定はノイズを加える
- **パス率と共にコストを追跡する** — 10倍のコストで95%のエージェントは最適な選択ではない可能性がある
- **タスク定義をバージョン管理する** — テストフィクスチャと同様にコードとして扱う

## リンク

- リポジトリ: [github.com/joaquinhuigomez/agent-eval](https://github.com/joaquinhuigomez/agent-eval)
