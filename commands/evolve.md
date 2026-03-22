---
name: evolve
description: instinct を分析し、進化した構造を提案または生成します
command: true
---

# Evolve コマンド

## 実装

プラグインルートパスを使用して instinct CLI を実行:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" evolve [--generate]
```

または `CLAUDE_PLUGIN_ROOT` が設定されていない場合（手動インストール）:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve [--generate]
```

instinct を分析し、関連するものを上位レベルの構造にクラスター化します:
- **Commands**: instinct がユーザーが呼び出すアクションを記述する場合
- **Skills**: instinct が自動トリガーされる動作を記述する場合
- **Agents**: instinct が複雑な複数ステップのプロセスを記述する場合

## 使用方法

```
/evolve                    # すべての instinct を分析して進化を提案
/evolve --generate         # 分析に加えて evolved/{skills,commands,agents} にファイルを生成
```

## 進化ルール

### → Command（ユーザー呼び出し）
instinct がユーザーが明示的に要求するアクションを記述する場合:
- 「ユーザーが...を求めるとき」に関する複数の instinct
- 「新しい X を作成するとき」のようなトリガーを持つ instinct
- 繰り返し可能なシーケンスに従う instinct

例:
- `new-table-step1`: "データベーステーブルを追加するとき、マイグレーションを作成"
- `new-table-step2`: "データベーステーブルを追加するとき、スキーマを更新"
- `new-table-step3`: "データベーステーブルを追加するとき、型を再生成"

→ 作成: **new-table** コマンド

### → Skill（自動トリガー）
instinct が自動的に発生すべき動作を記述する場合:
- パターンマッチングトリガー
- エラーハンドリング応答
- コードスタイルの強制

例:
- `prefer-functional`: "関数を書くとき、関数型スタイルを優先"
- `use-immutable`: "状態を変更するとき、イミュータブルパターンを使用"
- `avoid-classes`: "モジュールを設計するとき、クラスベースの設計を避ける"

→ 作成: `functional-patterns` スキル

### → Agent（深さ/分離が必要）
instinct が分離の恩恵を受ける複雑な複数ステップのプロセスを記述する場合:
- デバッグワークフロー
- リファクタリングシーケンス
- リサーチタスク

例:
- `debug-step1`: "デバッグするとき、まずログを確認"
- `debug-step2`: "デバッグするとき、失敗しているコンポーネントを分離"
- `debug-step3`: "デバッグするとき、最小限の再現を作成"
- `debug-step4`: "デバッグするとき、テストで修正を検証"

→ 作成: **debugger** エージェント

## 実行内容

1. 現在のプロジェクトコンテキストを検出
2. プロジェクトとグローバルの instinct を読み取り（ID 競合時はプロジェクトが優先）
3. トリガー/ドメインパターンで instinct をグループ化
4. 以下を特定:
   - Skill 候補（2件以上の instinct を持つトリガークラスター）
   - Command 候補（高信頼度のワークフロー instinct）
   - Agent 候補（より大きな高信頼度クラスター）
5. 該当する場合にプロモーション候補（project -> global）を表示
6. `--generate` が渡された場合、以下にファイルを書き込み:
   - プロジェクトスコープ: `~/.claude/homunculus/projects/<project-id>/evolved/`
   - グローバルフォールバック: `~/.claude/homunculus/evolved/`

## 出力フォーマット

```
============================================================
  EVOLVE ANALYSIS - 12 instincts
  Project: my-app (a1b2c3d4e5f6)
  Project-scoped: 8 | Global: 4
============================================================

High confidence instincts (>=80%): 5

## SKILL CANDIDATES
1. Cluster: "adding tests"
   Instincts: 3
   Avg confidence: 82%
   Domains: testing
   Scopes: project

## COMMAND CANDIDATES (2)
  /adding-tests
    From: test-first-workflow [project]
    Confidence: 84%

## AGENT CANDIDATES (1)
  adding-tests-agent
    Covers 3 instincts
    Avg confidence: 82%
```

## フラグ

- `--generate`: 分析出力に加えて進化したファイルを生成

## 生成されるファイルフォーマット

### Command
```markdown
---
name: new-table
description: Create a new database table with migration, schema update, and type generation
command: /new-table
evolved_from:
  - new-table-migration
  - update-schema
  - regenerate-types
---

# New Table Command

[クラスター化された instinct に基づいて生成されたコンテンツ]

## Steps
1. ...
2. ...
```

### Skill
```markdown
---
name: functional-patterns
description: Enforce functional programming patterns
evolved_from:
  - prefer-functional
  - use-immutable
  - avoid-classes
---

# Functional Patterns Skill

[クラスター化された instinct に基づいて生成されたコンテンツ]
```

### Agent
```markdown
---
name: debugger
description: Systematic debugging agent
model: sonnet
evolved_from:
  - debug-check-logs
  - debug-isolate
  - debug-reproduce
---

# Debugger Agent

[クラスター化された instinct に基づいて生成されたコンテンツ]
```
