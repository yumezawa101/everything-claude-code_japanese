---
description: 所有権、ライフタイム、エラーハンドリング、unsafe の使用、慣用的なパターンについての包括的な Rust コードレビュー。rust-reviewer エージェントを呼び出します。
---

# Rust Code Review

このコマンドは Rust 固有の包括的なコードレビューのために **rust-reviewer** エージェントを呼び出します。

## このコマンドの機能

1. **自動チェックの検証**: `cargo check`、`cargo clippy -- -D warnings`、`cargo fmt --check`、`cargo test` を実行 -- いずれか失敗したら停止
2. **Rust 変更の特定**: `git diff HEAD~1`（PR の場合は `git diff main...HEAD`）で変更された `.rs` ファイルを検出
3. **セキュリティ監査の実行**: 利用可能な場合 `cargo audit` を実行
4. **セキュリティスキャン**: unsafe の使用、コマンドインジェクション、ハードコードされた秘密情報をチェック
5. **所有権レビュー**: 不要な clone、ライフタイムの問題、借用パターンを分析
6. **レポート生成**: 問題を重大度別に分類

## レビューカテゴリ

### CRITICAL（必須修正）
- 本番コードパスでのチェックなしの `unwrap()`/`expect()`
- `// SAFETY:` コメントなしの `unsafe`
- クエリ内の文字列補間による SQL インジェクション
- `std::process::Command` での未検証入力によるコマンドインジェクション
- ハードコードされた認証情報
- 生ポインタによる解放後使用

### HIGH（修正推奨）
- 借用チェッカーを満たすための不要な `.clone()`
- `&str` や `impl AsRef<str>` で十分な場所での `String` パラメータ
- async コンテキストでのブロッキング（`std::thread::sleep`、`std::fs`）
- 共有型での `Send`/`Sync` バウンドの欠落
- ビジネスクリティカルな enum でのワイルドカード `_ =>` マッチ
- 大きな関数（50行超）

### MEDIUM（検討）
- ホットパスでの不要なアロケーション
- サイズが既知の場合の `with_capacity` の欠落
- 正当な理由なしの clippy 警告抑制
- `///` ドキュメントのないパブリック API
- 値を無視するとバグになりそうな非 `must_use` 戻り型での `#[must_use]` の検討

## 承認基準

| ステータス | 条件 |
|--------|-----------|
| 承認 | CRITICAL または HIGH 問題なし |
| 警告 | MEDIUM 問題のみ（注意してマージ） |
| ブロック | CRITICAL または HIGH 問題が発見された |

## 他のコマンドとの統合

- まず `/rust-test` を使用してテストが合格することを確認
- `/rust-build` をビルドエラー発生時に使用
- `/rust-review` をコミット前に使用
- `/code-review` を Rust 固有でない問題に使用

## 関連

- Agent: `agents/rust-reviewer.md`
- Skills: `skills/rust-patterns/`, `skills/rust-testing/`
