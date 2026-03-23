---
paths:
  - "**/*.php"
  - "**/composer.json"
  - "**/phpstan.neon"
  - "**/phpstan.neon.dist"
  - "**/psalm.xml"
---
# PHP Hooks

> このファイルは [common/hooks.md](../common/hooks.md) を PHP 固有のコンテンツで拡張します。

## PostToolUse Hooks

`~/.claude/settings.json` で設定:

- **Pint / PHP-CS-Fixer**: 編集された `.php` ファイルを自動フォーマット。
- **PHPStan / Psalm**: 型付きコードベースでの PHP 編集後に静的解析を実行。
- **PHPUnit / Pest**: 編集が振る舞いに影響する場合、対象のファイルやモジュールに対してテストを実行。

## 警告

- 編集されたファイルに残された `var_dump`、`dd`、`dump`、`die()` について警告。
- 編集された PHP ファイルが生 SQL を追加したり、CSRF/セッション保護を無効化した場合に警告。
