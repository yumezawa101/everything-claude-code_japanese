# Git ワークフロー

## コミットメッセージ形式
```
<type>: <description>

<optional body>
```

タイプ: feat, fix, refactor, docs, test, chore, perf, ci

注意: アトリビューションは ~/.claude/settings.json でグローバルに無効化済み。

## Pull Request ワークフロー

PR 作成時:
1. 完全なコミット履歴を分析（最新コミットだけでなく）
2. `git diff [base-branch]...HEAD` ですべての変更を確認
3. 包括的な PR サマリーをドラフト
4. TODO 付きのテストプランを含める
5. 新しいブランチの場合は `-u` フラグでプッシュ

> Git 操作の前の完全な開発プロセス（計画、TDD、コードレビュー）については、
> [development-workflow.md](./development-workflow.md) を参照。
