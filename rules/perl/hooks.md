---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Perl Hooks

> このファイルは [common/hooks.md](../common/hooks.md) を Perl 固有のコンテンツで拡張します。

## PostToolUse Hooks

`~/.claude/settings.json` で設定:

- **perltidy**: 編集後に `.pl` と `.pm` ファイルを自動フォーマット
- **perlcritic**: `.pm` ファイルの編集後にリントチェックを実行

## 警告

- スクリプトでない `.pm` ファイルの `print` について警告 -- `say` またはロギングモジュール（例: `Log::Any`）を使用
