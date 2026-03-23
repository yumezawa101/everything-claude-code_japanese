---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
---
# Rust Hooks

> このファイルは [common/hooks.md](../common/hooks.md) を Rust 固有のコンテンツで拡張します。

## PostToolUse Hooks

`~/.claude/settings.json` で設定:

- **cargo fmt**: 編集後に `.rs` ファイルを自動フォーマット
- **cargo clippy**: Rust ファイルの編集後にリントチェックを実行
- **cargo check**: 変更後にコンパイルを検証（`cargo build` より高速）
