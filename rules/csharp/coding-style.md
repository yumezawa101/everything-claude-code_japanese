---
paths:
  - "**/*.cs"
  - "**/*.csx"
---
# C# コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を C# 固有のコンテンツで拡張します。

## 標準

- 現在の .NET 規約に従い、nullable 参照型を有効化
- public および internal API には明示的なアクセス修飾子を優先
- ファイルはそれが定義する主要な型と一致させる

## 型とモデル

- イミュータブルな値的モデルには `record` または `record struct` を優先
- アイデンティティとライフサイクルを持つエンティティや型には `class` を使用
- Service 境界と抽象化には `interface` を使用
- アプリケーションコードでの `dynamic` を避ける; ジェネリクスまたは明示的なモデルを優先

```csharp
public sealed record UserDto(Guid Id, string Email);

public interface IUserRepository
{
    Task<UserDto?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
}
```

## イミュータビリティ

- 共有状態には `init` セッター、コンストラクタパラメータ、イミュータブルコレクションを優先
- 更新された状態を生成する際に入力モデルをインプレースでミューテーションしない

```csharp
public sealed record UserProfile(string Name, string Email);

public static UserProfile Rename(UserProfile profile, string name) =>
    profile with { Name = name };
```

## 非同期とエラーハンドリング

- `.Result` や `.Wait()` のようなブロッキング呼び出しより `async`/`await` を優先
- public な非同期 API には `CancellationToken` を渡す
- 特定の例外をスローし、構造化プロパティでログ

```csharp
public async Task<Order> LoadOrderAsync(
    Guid orderId,
    CancellationToken cancellationToken)
{
    try
    {
        return await repository.FindAsync(orderId, cancellationToken)
            ?? throw new InvalidOperationException($"Order {orderId} was not found.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to load order {OrderId}", orderId);
        throw;
    }
}
```

## フォーマット

- フォーマットとアナライザー修正に `dotnet format` を使用
- `using` ディレクティブを整理し、未使用のインポートを削除
- 式本体メンバーは可読性が保たれる場合のみ優先
