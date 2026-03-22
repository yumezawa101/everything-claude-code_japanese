---
name: projects
description: 既知のプロジェクトとその instinct 統計を一覧表示
command: true
---

# Projects コマンド

continuous-learning-v2 のプロジェクトレジストリエントリとプロジェクトごとの instinct/観察回数を一覧表示します。

## 実装

プラグインルートパスを使用して instinct CLI を実行:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" projects
```

または `CLAUDE_PLUGIN_ROOT` が設定されていない場合（手動インストール）:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py projects
```

## 使用方法

```bash
/projects
```

## 実行内容

1. `~/.claude/homunculus/projects.json` を読み取り
2. 各プロジェクトについて以下を表示:
   - プロジェクト名、ID、ルート、リモート
   - 個人および継承された instinct 数
   - 観察イベント数
   - 最終確認タイムスタンプ
3. グローバルな instinct の合計も表示
