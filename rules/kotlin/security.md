---
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# Kotlin セキュリティ

> このファイルは [common/security.md](../common/security.md) を Kotlin および Android/KMP 固有のコンテンツで拡張します。

## シークレット管理

- API キー、トークン、クレデンシャルをソースコードにハードコードしない
- ローカル開発のシークレットには `local.properties`（git-ignored）を使用
- リリースビルドには CI シークレットから生成される `BuildConfig` フィールドを使用
- ランタイムのシークレット保存には `EncryptedSharedPreferences`（Android）または Keychain（iOS）を使用

```kotlin
// BAD
val apiKey = "sk-abc123..."

// GOOD — BuildConfig から（ビルド時に生成）
val apiKey = BuildConfig.API_KEY

// GOOD — ランタイムにセキュアストレージから
val token = secureStorage.get("auth_token")
```

## ネットワークセキュリティ

- HTTPS のみを使用 -- `network_security_config.xml` でクリアテキストをブロックするよう設定
- 機密性の高いエンドポイントには OkHttp の `CertificatePinner` または Ktor 相当の機能で証明書ピンニング
- すべての HTTP クライアントにタイムアウトを設定 -- デフォルト（無限になる場合がある）のままにしない
- すべてのサーバーレスポンスを使用前にバリデーションとサニタイズ

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
</network-security-config>
```

## 入力バリデーション

- すべてのユーザー入力を処理または API 送信前にバリデーション
- Room/SQLDelight にはパラメータ化クエリを使用 -- ユーザー入力を SQL に連結しない
- パストラバーサルを防止するためにユーザー入力からのファイルパスをサニタイズ

```kotlin
// BAD — SQL インジェクション
@Query("SELECT * FROM items WHERE name = '$input'")

// GOOD — パラメータ化
@Query("SELECT * FROM items WHERE name = :input")
fun findByName(input: String): List<ItemEntity>
```

## データ保護

- Android での機密性の高いキーバリューデータには `EncryptedSharedPreferences` を使用
- 明示的なフィールド名を持つ `@Serializable` を使用 -- 内部プロパティ名を漏洩させない
- 不要になった機密データはメモリからクリア
- シリアライズされたクラスには `@Keep` または ProGuard ルールで名前マングリングを防止

## 認証

- トークンはプレーンな SharedPreferences ではなくセキュアストレージに保存
- 適切な 401/403 ハンドリングでトークンリフレッシュを実装
- ログアウト時にすべての認証状態をクリア（トークン、キャッシュされたユーザーデータ、Cookie）
- 機密操作にはバイオメトリクス認証（`BiometricPrompt`）を使用

## ProGuard / R8

- すべてのシリアライズされたモデルに keep ルール（`@Serializable`、Gson、Moshi）
- リフレクションベースのライブラリに keep ルール（Koin、Retrofit）
- リリースビルドをテスト -- 難読化はシリアライゼーションを無言で壊す可能性がある

## WebView セキュリティ

- 明示的に必要でない限り JavaScript を無効化: `settings.javaScriptEnabled = false`
- WebView にロードする前に URL をバリデーション
- 機密データにアクセスする `@JavascriptInterface` メソッドを公開しない
- `WebViewClient.shouldOverrideUrlLoading()` でナビゲーションを制御
