---
paths:
  - "**/*.rs"
---
# Rust セキュリティ

> このファイルは [common/security.md](../common/security.md) を Rust 固有のコンテンツで拡張します。

## シークレット管理

- API キー、トークン、クレデンシャルをソースコードにハードコードしない
- 環境変数を使用: `std::env::var("API_KEY")`
- 必要なシークレットが起動時に欠けている場合はフェイルファスト
- `.env` ファイルは `.gitignore` に追加

```rust
// BAD
const API_KEY: &str = "sk-abc123...";

// GOOD — 早期バリデーション付きの環境変数
fn load_api_key() -> anyhow::Result<String> {
    std::env::var("PAYMENT_API_KEY")
        .context("PAYMENT_API_KEY must be set")
}
```

## SQL インジェクション防止

- 常にパラメータ化クエリを使用 -- ユーザー入力を SQL 文字列にフォーマットしない
- バインドパラメータ付きのクエリビルダまたは ORM（sqlx、diesel、sea-orm）を使用

```rust
// BAD — フォーマット文字列による SQL インジェクション
let query = format!("SELECT * FROM users WHERE name = '{name}'");
sqlx::query(&query).fetch_one(&pool).await?;

// GOOD — sqlx によるパラメータ化クエリ
// プレースホルダ構文はバックエンドにより異なる: Postgres: $1  |  MySQL: ?  |  SQLite: $1
sqlx::query("SELECT * FROM users WHERE name = $1")
    .bind(&name)
    .fetch_one(&pool)
    .await?;
```

## 入力バリデーション

- すべてのユーザー入力を処理前にシステム境界でバリデーション
- 型システムを使用して不変条件を強制（newtype パターン）
- バリデーションではなくパース -- 境界で非構造化データを型付き構造体に変換
- 無効な入力は明確なエラーメッセージで拒否

```rust
// パースする、バリデーションしない — 不正な状態は表現不可能
pub struct Email(String);

impl Email {
    pub fn parse(input: &str) -> Result<Self, ValidationError> {
        let trimmed = input.trim();
        let at_pos = trimmed.find('@')
            .filter(|&p| p > 0 && p < trimmed.len() - 1)
            .ok_or_else(|| ValidationError::InvalidEmail(input.to_string()))?;
        let domain = &trimmed[at_pos + 1..];
        if trimmed.len() > 254 || !domain.contains('.') {
            return Err(ValidationError::InvalidEmail(input.to_string()));
        }
        // 本番環境では、バリデーション済みメールクレート（例: `email_address`）の使用を推奨
        Ok(Self(trimmed.to_string()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

## Unsafe コード

- `unsafe` ブロックを最小限に -- 安全な抽象化を優先
- すべての `unsafe` ブロックには不変条件を説明する `// SAFETY:` コメントが必要
- 利便性のために借用チェッカーをバイパスする目的で `unsafe` を使用しない
- レビュー時にすべての `unsafe` コードを監査 -- 正当な理由がなければレッドフラグ
- C ライブラリの周りには安全な FFI ラッパーを優先

```rust
// GOOD — safety コメントが必要なすべての不変条件を文書化
let widget: &Widget = {
    // SAFETY: `ptr` is non-null, aligned, points to an initialized Widget,
    // and no mutable references or mutations exist for its lifetime.
    unsafe { &*ptr }
};

// BAD — safety の正当化なし
unsafe { &*ptr }
```

## 依存関係のセキュリティ

- `cargo audit` で依存関係の既知の CVE をスキャン
- `cargo deny check` でライセンスとアドバイザリのコンプライアンスを確認
- `cargo tree` で推移的依存関係を監査
- 依存関係を最新に保つ -- Dependabot または Renovate を設定
- 依存関係の数を最小限に -- 新しいクレートを追加する前に評価

```bash
# セキュリティ監査
cargo audit

# アドバイザリ、重複バージョン、制限付きライセンスを拒否
cargo deny check

# 依存関係ツリーを調査
cargo tree
cargo tree -d  # 重複のみ表示
```

## エラーメッセージ

- API レスポンスで内部パス、スタックトレース、データベースエラーを公開しない
- 詳細なエラーはサーバーサイドでログ; クライアントには一般的なメッセージを返す
- 構造化されたサーバーサイドロギングに `tracing` または `log` を使用

```rust
// エラーを適切なステータスコードと一般的なメッセージにマッピング
// （例では axum を使用; レスポンス型はフレームワークに合わせて適応）
match order_service.find_by_id(id) {
    Ok(order) => Ok((StatusCode::OK, Json(order))),
    Err(ServiceError::NotFound(_)) => {
        tracing::info!(order_id = id, "order not found");
        Err((StatusCode::NOT_FOUND, "Resource not found"))
    }
    Err(e) => {
        tracing::error!(order_id = id, error = %e, "unexpected error");
        Err((StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"))
    }
}
```

## リファレンス

unsafe コードのガイドラインと所有権パターンについては、スキル: `rust-patterns` を参照。
一般的なセキュリティチェックリストについては、スキル: `security-review` を参照。
