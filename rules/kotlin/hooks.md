---
paths:
  - "**/*.kt"
  - "**/*.kts"
  - "**/build.gradle.kts"
---
# Kotlin Hooks

> このファイルは [common/hooks.md](../common/hooks.md) を Kotlin 固有のコンテンツで拡張します。

## PostToolUse Hooks

`~/.claude/settings.json` で設定:

- **ktfmt/ktlint**: 編集後に `.kt` と `.kts` ファイルを自動フォーマット
- **detekt**: Kotlin ファイルの編集後に静的解析を実行
- **./gradlew build**: 変更後にコンパイルを検証
