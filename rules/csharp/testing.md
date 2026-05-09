---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
---
# C# テスト

> このファイルは [common/testing.md](../common/testing.md) を C# 固有のコンテンツで拡張します。

## テストフレームワーク

- ユニットテストとインテグレーションテストには **xUnit** を優先
- 可読性の高いアサーションに **FluentAssertions** を使用
- 依存関係のモックに **Moq** または **NSubstitute** を使用
- インテグレーションテストで実際のインフラストラクチャが必要な場合は **Testcontainers** を使用

## テストの整理

- `tests/` の下に `src/` の構造をミラーリング
- ユニット、インテグレーション、E2E のカバレッジを明確に分離
- テストは実装の詳細ではなく振る舞いで命名

```csharp
public sealed class OrderServiceTests
{
    [Fact]
    public async Task FindByIdAsync_ReturnsOrder_WhenOrderExists()
    {
        // Arrange
        // Act
        // Assert
    }
}
```

## ASP.NET Core インテグレーションテスト

- API インテグレーションカバレッジに `WebApplicationFactory<TEntryPoint>` を使用
- ミドルウェアをバイパスせず、HTTP 経由で認証、バリデーション、シリアライゼーションをテスト

## カバレッジ

- 80%以上の行カバレッジを目標
- ドメインロジック、バリデーション、認証、失敗パスにカバレッジを集中
- 利用可能な場合はカバレッジ収集を有効にして CI で `dotnet test` を実行
