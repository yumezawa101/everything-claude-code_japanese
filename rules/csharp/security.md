---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
  - "**/appsettings*.json"
---
# C# セキュリティ

> このファイルは [common/security.md](../common/security.md) を C# 固有のコンテンツで拡張します。

## シークレット管理

- API キー、トークン、接続文字列をソースコードにハードコードしない
- ローカル開発には環境変数やユーザーシークレット、本番環境にはシークレットマネージャを使用
- `appsettings.*.json` に本物のクレデンシャルを含めない

```csharp
// BAD
const string ApiKey = "sk-live-123";

// GOOD
var apiKey = builder.Configuration["OpenAI:ApiKey"]
    ?? throw new InvalidOperationException("OpenAI:ApiKey is not configured.");
```

## SQL インジェクション防止

- ADO.NET、Dapper、EF Core で常にパラメータ化クエリを使用
- ユーザー入力を SQL 文字列に連結しない
- 動的クエリ構成を使用する前にソートフィールドとフィルタ演算子をバリデーション

```csharp
const string sql = "SELECT * FROM Orders WHERE CustomerId = @customerId";
await connection.QueryAsync<Order>(sql, new { customerId });
```

## 入力バリデーション

- アプリケーション境界で DTO をバリデーション
- データアノテーション、FluentValidation、または明示的なガード句を使用
- ビジネスロジック実行前に無効なモデル状態を拒否

## 認証と認可

- カスタムのトークン解析よりもフレームワークの認証ハンドラを優先
- エンドポイントまたはハンドラの境界で認可ポリシーを強制
- 生のトークン、パスワード、PII をログに記録しない

## エラーハンドリング

- 安全なクライアント向けメッセージを返す
- 詳細な例外は構造化されたコンテキスト付きでサーバーサイドにログ
- API レスポンスでスタックトレース、SQL テキスト、ファイルシステムパスを公開しない

## リファレンス

より広範なアプリケーションセキュリティレビューチェックリストについては、スキル: `security-review` を参照。
