---
paths:
  - "**/*.java"
---
# Java セキュリティ

> このファイルは [common/security.md](../common/security.md) を Java 固有のコンテンツで拡張します。

## シークレット管理

- API キー、トークン、クレデンシャルをソースコードにハードコードしない
- 環境変数を使用: `System.getenv("API_KEY")`
- 本番環境のシークレットにはシークレットマネージャ（Vault、AWS Secrets Manager）を使用
- シークレットを含むローカル設定ファイルは `.gitignore` に追加

```java
// BAD
private static final String API_KEY = "sk-abc123...";

// GOOD — 環境変数
String apiKey = System.getenv("PAYMENT_API_KEY");
Objects.requireNonNull(apiKey, "PAYMENT_API_KEY must be set");
```

## SQL インジェクション防止

- 常にパラメータ化クエリを使用 -- ユーザー入力を SQL に連結しない
- `PreparedStatement` またはフレームワークのパラメータ化クエリ API を使用
- ネイティブクエリで使用される入力はすべてバリデーションとサニタイズを行う

```java
// BAD — 文字列連結による SQL インジェクション
Statement stmt = conn.createStatement();
String sql = "SELECT * FROM orders WHERE name = '" + name + "'";
stmt.executeQuery(sql);

// GOOD — パラメータ化クエリの PreparedStatement
PreparedStatement ps = conn.prepareStatement("SELECT * FROM orders WHERE name = ?");
ps.setString(1, name);

// GOOD — JDBC template
jdbcTemplate.query("SELECT * FROM orders WHERE name = ?", mapper, name);
```

## 入力バリデーション

- すべてのユーザー入力を処理前にシステム境界でバリデーションする
- バリデーションフレームワーク使用時は DTO に Bean Validation（`@NotNull`、`@NotBlank`、`@Size`）を使用
- ファイルパスやユーザー提供の文字列は使用前にサニタイズ
- バリデーション失敗時は明確なエラーメッセージで入力を拒否

```java
// プレーンな Java での手動バリデーション
public Order createOrder(String customerName, BigDecimal amount) {
    if (customerName == null || customerName.isBlank()) {
        throw new IllegalArgumentException("Customer name is required");
    }
    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException("Amount must be positive");
    }
    return new Order(customerName, amount);
}
```

## 認証と認可

- カスタムの暗号化認証を実装しない -- 実績のあるライブラリを使用
- パスワードは bcrypt または Argon2 で保存、MD5/SHA1 は使用しない
- Service 境界で認可チェックを強制
- ログから機密データをクリア -- パスワード、トークン、PII をログに記録しない

## 依存関係のセキュリティ

- `mvn dependency:tree` または `./gradlew dependencies` で推移的依存関係を監査
- OWASP Dependency-Check または Snyk で既知の CVE をスキャン
- 依存関係を最新に保つ -- Dependabot または Renovate を設定

## エラーメッセージ

- API レスポンスでスタックトレース、内部パス、SQL エラーを公開しない
- ハンドラ境界で例外を安全で一般的なクライアントメッセージにマッピング
- 詳細なエラーはサーバーサイドでログ; クライアントには一般的なメッセージを返す

```java
// 詳細をログに記録し、一般的なメッセージを返す
try {
    return orderService.findById(id);
} catch (OrderNotFoundException ex) {
    log.warn("Order not found: id={}", id);
    return ApiResponse.error("Resource not found");  // 一般的、内部情報なし
} catch (Exception ex) {
    log.error("Unexpected error processing order id={}", id, ex);
    return ApiResponse.error("Internal server error");  // ex.getMessage() を公開しない
}
```

## リファレンス

Spring Security の認証・認可パターンについては、スキル: `springboot-security` を参照。
一般的なセキュリティチェックリストについては、スキル: `security-review` を参照。
