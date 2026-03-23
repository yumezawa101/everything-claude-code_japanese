---
paths:
  - "**/*.cs"
  - "**/*.csx"
---
# C# パターン

> このファイルは [common/patterns.md](../common/patterns.md) を C# 固有のコンテンツで拡張します。

## API レスポンスパターン

```csharp
public sealed record ApiResponse<T>(
    bool Success,
    T? Data = default,
    string? Error = null,
    object? Meta = null);
```

## Repository パターン

```csharp
public interface IRepository<T>
{
    Task<IReadOnlyList<T>> FindAllAsync(CancellationToken cancellationToken);
    Task<T?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<T> CreateAsync(T entity, CancellationToken cancellationToken);
    Task<T> UpdateAsync(T entity, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
```

## Options パターン

コードベース全体で生の文字列を読み取る代わりに、設定には強く型付けされた Options を使用。

```csharp
public sealed class PaymentsOptions
{
    public const string SectionName = "Payments";
    public required string BaseUrl { get; init; }
    public required string ApiKeySecretName { get; init; }
}
```

## 依存性注入

- Service 境界ではインターフェースに依存
- コンストラクタは集中させる; Service の依存関係が多すぎる場合は責務を分割
- ライフタイムを意図的に登録: ステートレス/共有 Service には singleton、リクエストデータには scoped、軽量な純粋ワーカーには transient
