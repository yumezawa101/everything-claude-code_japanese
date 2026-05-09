---
description: Rust ビルドエラー、借用チェッカーの問題、依存関係の問題を段階的に修正します。最小限の外科的修正のために rust-build-resolver エージェントを呼び出します。
---

# Rust Build and Fix

このコマンドは **rust-build-resolver** エージェントを呼び出し、最小限の変更で Rust ビルドエラーを段階的に修正します。

## このコマンドの機能

1. **診断の実行**: `cargo check`、`cargo clippy`、`cargo fmt --check` を実行
2. **エラーの解析**: エラーコードと影響を受けるファイルを特定
3. **段階的修正**: 一度に1つのエラーを修正
4. **各修正の検証**: 各変更後に `cargo check` を再実行
5. **サマリーの報告**: 修正されたものと残っているものを表示

## 使用するタイミング

以下の場合に `/rust-build` を使用:
- `cargo build` または `cargo check` がエラーで失敗する場合
- `cargo clippy` が警告を報告する場合
- 借用チェッカーやライフタイムエラーがコンパイルをブロックしている場合
- Cargo の依存関係解決が失敗する場合
- ビルドを壊す変更をプルした後

## 実行される診断コマンド

```bash
# プライマリビルドチェック
cargo check 2>&1

# リントと提案
cargo clippy -- -D warnings 2>&1

# フォーマットチェック
cargo fmt --check 2>&1

# 依存関係の問題
cargo tree --duplicates

# セキュリティ監査（利用可能な場合）
if command -v cargo-audit >/dev/null; then cargo audit; else echo "cargo-audit not installed"; fi
```

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `cannot borrow as mutable` | 不変借用を先に終了するよう再構築；正当な場合のみ clone |
| `does not live long enough` | 所有型を使用またはライフタイムアノテーションを追加 |
| `cannot move out of` | 所有権を取得するよう再構築；clone は最後の手段 |
| `mismatched types` | `.into()`、`as`、または明示的な変換を追加 |
| `trait X not implemented` | `#[derive(Trait)]` を追加または手動で実装 |
| `unresolved import` | Cargo.toml に追加または `use` パスを修正 |
| `cannot find value` | import を追加またはパスを修正 |

## 修正戦略

1. **まずビルドエラー** - コードがコンパイルできる必要がある
2. **次に Clippy 警告** - 疑わしい構造を修正
3. **最後にフォーマット** - `cargo fmt` 準拠
4. **一度に1つの修正** - 各変更を検証
5. **最小限の変更** - リファクタリングではなく修正のみ

## 停止条件

以下の場合、エージェントは停止して報告:
- 同じエラーが3回の試行後も持続
- 修正がさらなるエラーを引き起こす
- アーキテクチャの変更が必要
- 借用チェッカーエラーがデータ所有権の再設計を必要とする

## 関連コマンド

- `/rust-test` - ビルド成功後にテストを実行
- `/rust-review` - コード品質をレビュー
- `/verify` - 完全な検証ループ

## 関連

- Agent: `agents/rust-build-resolver.md`
- Skill: `skills/rust-patterns/`
