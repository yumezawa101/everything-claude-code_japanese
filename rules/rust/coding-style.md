---
paths:
  - "**/*.rs"
---
# Rust コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Rust 固有のコンテンツで拡張します。

## フォーマット

- **rustfmt** で強制 -- コミット前に常に `cargo fmt` を実行
- **clippy** でリント -- `cargo clippy -- -D warnings`（警告をエラーとして扱う）
- 4 スペースインデント（rustfmt デフォルト）
- 最大行幅: 100 文字（rustfmt デフォルト）

## イミュータビリティ

Rust の変数はデフォルトでイミュータブル -- これを活用する:

- デフォルトで `let` を使用; ミューテーションが必要な場合のみ `let mut` を使用
- ミューテーションよりも新しい値を返すことを優先
- 関数がアロケーションを必要とするかもしれないし必要としないかもしれない場合は `Cow<'_, T>` を使用

```rust
use std::borrow::Cow;

// GOOD — デフォルトでイミュータブル、新しい値を返す
fn normalize(input: &str) -> Cow<'_, str> {
    if input.contains(' ') {
        Cow::Owned(input.replace(' ', "_"))
    } else {
        Cow::Borrowed(input)
    }
}

// BAD — 不必要なミューテーション
fn normalize_bad(input: &mut String) {
    *input = input.replace(' ', "_");
}
```

## 命名規則

標準的な Rust の規約に従う:
- `snake_case`: 関数、メソッド、変数、モジュール、クレート
- `PascalCase`（UpperCamelCase）: 型、トレイト、列挙型、型パラメータ
- `SCREAMING_SNAKE_CASE`: 定数とスタティック
- ライフタイム: 短い小文字（`'a`、`'de`）-- 複雑な場合は記述的な名前（`'input`）

## 所有権と借用

- デフォルトで借用（`&T`）; 保存または消費が必要な場合のみ所有権を取得
- 根本原因を理解せずに借用チェッカーを満たすためだけにクローンしない
- 関数パラメータでは `String` より `&str`、`Vec<T>` より `&[T]` を受け入れる
- `String` を所有する必要があるコンストラクタには `impl Into<String>` を使用

```rust
// GOOD — 所有権が不要な場合は借用
fn word_count(text: &str) -> usize {
    text.split_whitespace().count()
}

// GOOD — Into を使ったコンストラクタで所有権を取得
fn new(name: impl Into<String>) -> Self {
    Self { name: name.into() }
}

// BAD — &str で十分なのに String を取得
fn word_count_bad(text: String) -> usize {
    text.split_whitespace().count()
}
```

## エラーハンドリング

- `Result<T, E>` と `?` で伝播 -- 本番コードでは `unwrap()` を使用しない
- **ライブラリ**: `thiserror` で型付きエラーを定義
- **アプリケーション**: `anyhow` で柔軟なエラーコンテキストを使用
- `.with_context(|| format!("failed to ..."))?` でコンテキストを追加
- `unwrap()` / `expect()` はテストと本当に到達不可能な状態のみに予約

```rust
// GOOD — thiserror によるライブラリエラー
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("failed to read config: {0}")]
    Io(#[from] std::io::Error),
    #[error("invalid config format: {0}")]
    Parse(String),
}

// GOOD — anyhow によるアプリケーションエラー
use anyhow::Context;

fn load_config(path: &str) -> anyhow::Result<Config> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("failed to read {path}"))?;
    toml::from_str(&content)
        .with_context(|| format!("failed to parse {path}"))
}
```

## ループよりイテレータ

変換にはイテレータチェーンを優先; 複雑な制御フローにはループを使用:

```rust
// GOOD — 宣言的で合成可能
let active_emails: Vec<&str> = users.iter()
    .filter(|u| u.is_active)
    .map(|u| u.email.as_str())
    .collect();

// GOOD — 早期リターンを含む複雑なロジックにはループ
for user in &users {
    if let Some(verified) = verify_email(&user.email)? {
        send_welcome(&verified)?;
    }
}
```

## モジュール構成

型ではなくドメインで整理する:

```text
src/
├── main.rs
├── lib.rs
├── auth/           # ドメインモジュール
│   ├── mod.rs
│   ├── token.rs
│   └── middleware.rs
├── orders/         # ドメインモジュール
│   ├── mod.rs
│   ├── model.rs
│   └── service.rs
└── db/             # インフラストラクチャ
    ├── mod.rs
    └── pool.rs
```

## 可視性

- デフォルトは private; 内部共有には `pub(crate)` を使用
- クレートの公開 API の一部のみを `pub` にする
- `lib.rs` から公開 API を再エクスポート

## リファレンス

包括的な Rust イディオムとパターンについては、スキル: `rust-patterns` を参照。
