---
description: Rust の TDD ワークフローを適用します。テストを最初に記述し、その後実装します。cargo-llvm-cov で 80% 以上のカバレッジを確認します。
---

# Rust TDD コマンド

このコマンドは `#[test]`、rstest、proptest、mockall を使用した Rust コードのテスト駆動開発手法を適用します。

## このコマンドの機能

1. **型/トレイトの定義**: `todo!()` で関数シグネチャをスキャフォールディング
2. **テストの作成**: 包括的なテストモジュールを作成（RED）
3. **テストの実行**: テストが正しい理由で失敗することを確認
4. **コードの実装**: テストをパスするための最小限のコードを記述（GREEN）
5. **リファクタリング**: テストをグリーンに保ちながら改善
6. **カバレッジの確認**: cargo-llvm-cov で 80% 以上のカバレッジを保証

## 使用するタイミング

以下の場合に `/rust-test` を使用:
- 新しい Rust 関数、メソッド、トレイトの実装時
- 既存 Rust コードへのテストカバレッジ追加時
- バグ修正時（失敗するテストを最初に作成）
- 重要なビジネスロジックの構築時
- Rust での TDD ワークフローの学習時

## TDD サイクル

```
RED     -> 失敗するテストを最初に作成
GREEN   -> テストをパスするための最小限のコードを実装
REFACTOR -> コードを改善、テストはグリーンを保持
REPEAT  -> 次のテストケースへ
```

## テストパターン

### 単体テスト

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_two_numbers() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn handles_error() -> Result<(), Box<dyn std::error::Error>> {
        let result = parse_config(r#"port = 8080"#)?;
        assert_eq!(result.port, 8080);
        Ok(())
    }
}
```

### rstest によるパラメータ化テスト

```rust
use rstest::{rstest, fixture};

#[rstest]
#[case("hello", 5)]
#[case("", 0)]
#[case("rust", 4)]
fn test_string_length(#[case] input: &str, #[case] expected: usize) {
    assert_eq!(input.len(), expected);
}
```

### 非同期テスト

```rust
#[tokio::test]
async fn fetches_data_successfully() {
    let client = TestClient::new().await;
    let result = client.get("/data").await;
    assert!(result.is_ok());
}
```

### プロパティベーステスト

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn encode_decode_roundtrip(input in ".*") {
        let encoded = encode(&input);
        let decoded = decode(&encoded).unwrap();
        assert_eq!(input, decoded);
    }
}
```

## カバレッジコマンド

```bash
# サマリーレポート
cargo llvm-cov

# HTML レポート
cargo llvm-cov --html

# 閾値未満で失敗
cargo llvm-cov --fail-under-lines 80

# 特定のテストを実行
cargo test test_name

# 出力付きで実行
cargo test -- --nocapture

# 最初の失敗で停止しない
cargo test --no-fail-fast
```

## カバレッジ目標

| コードタイプ | 目標 |
|-----------|--------|
| 重要なビジネスロジック | 100% |
| パブリック API | 90%+ |
| 一般的なコード | 80%+ |
| 生成 / FFI バインディング | 除外 |

## TDD ベストプラクティス

**推奨事項:**
- 実装前にテストを最初に書く
- 各変更後にテストを実行
- より良いエラーメッセージのために `assert!` より `assert_eq!` を使用
- テストが `Result` を返す場合、クリーンな出力のために `?` を使用
- 実装ではなく動作をテスト
- エッジケースを含める（空、境界、エラーパス）

**避けるべき事項:**
- テストの前に実装を書く
- RED フェーズをスキップ
- `Result::is_err()` が使える場合に `#[should_panic]` を使用
- テストで `sleep()` を使用 -- チャネルや `tokio::time::pause()` を使用
- すべてをモック化 -- 可能な場合は統合テストを優先

## 関連コマンド

- `/rust-build` - ビルドエラーの修正
- `/rust-review` - 実装後のコードレビュー
- `/verify` - 完全な検証ループ

## 関連

- Skill: `skills/rust-testing/`
- Skill: `skills/rust-patterns/`
