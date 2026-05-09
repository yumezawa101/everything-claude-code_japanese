---
paths:
  - "**/*.java"
  - "**/pom.xml"
  - "**/build.gradle"
  - "**/build.gradle.kts"
---
# Java Hooks

> このファイルは [common/hooks.md](../common/hooks.md) を Java 固有のコンテンツで拡張します。

## PostToolUse Hooks

`~/.claude/settings.json` で設定:

- **google-java-format**: 編集後に `.java` ファイルを自動フォーマット
- **checkstyle**: Java ファイルの編集後にスタイルチェックを実行
- **./mvnw compile** または **./gradlew compileJava**: 変更後にコンパイルを検証
