---
paths:
  - "**/*.java"
---
# Java コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Java 固有のコンテンツで拡張します。

## フォーマット

- **google-java-format** または **Checkstyle**（Google または Sun スタイル）で強制
- ファイルごとに 1 つの public トップレベル型
- 一貫したインデント: 2 または 4 スペース（プロジェクト標準に合わせる）
- メンバー順序: 定数、フィールド、コンストラクタ、public メソッド、protected、private

## イミュータビリティ

- 値型には `record` を優先（Java 16+）
- フィールドはデフォルトで `final` にする -- ミュータブルな状態は必要な場合のみ使用
- public API からは防御的コピーを返す: `List.copyOf()`、`Map.copyOf()`、`Set.copyOf()`
- コピーオンライト: 既存のものを変更するのではなく、新しいインスタンスを返す

```java
// GOOD — イミュータブルな値型
public record OrderSummary(Long id, String customerName, BigDecimal total) {}

// GOOD — final フィールド、setter なし
public class Order {
    private final Long id;
    private final List<LineItem> items;

    public List<LineItem> getItems() {
        return List.copyOf(items);
    }
}
```

## 命名規則

標準的な Java 規約に従う:
- `PascalCase`: クラス、インターフェース、レコード、列挙型
- `camelCase`: メソッド、フィールド、パラメータ、ローカル変数
- `SCREAMING_SNAKE_CASE`: `static final` 定数
- パッケージ: すべて小文字、逆ドメイン（`com.example.app.service`）

## モダン Java 機能

明確さが向上する場合はモダンな言語機能を使用:
- **Records**: DTO と値型に（Java 16+）
- **Sealed classes**: 閉じた型階層に（Java 17+）
- **パターンマッチング**: `instanceof` で明示的なキャスト不要（Java 16+）
- **テキストブロック**: 複数行文字列に -- SQL、JSON テンプレート（Java 15+）
- **Switch 式**: アロー構文で（Java 14+）
- **Switch でのパターンマッチング**: 網羅的な sealed 型処理（Java 21+）

```java
// Pattern matching instanceof
if (shape instanceof Circle c) {
    return Math.PI * c.radius() * c.radius();
}

// Sealed type hierarchy
public sealed interface PaymentMethod permits CreditCard, BankTransfer, Wallet {}

// Switch expression
String label = switch (status) {
    case ACTIVE -> "Active";
    case SUSPENDED -> "Suspended";
    case CLOSED -> "Closed";
};
```

## Optional の使用

- 結果がない可能性のある finder メソッドからは `Optional<T>` を返す
- `map()`、`flatMap()`、`orElseThrow()` を使用 -- `isPresent()` なしで `get()` を呼ばない
- フィールド型やメソッドパラメータに `Optional` を使用しない

```java
// GOOD
return repository.findById(id)
    .map(ResponseDto::from)
    .orElseThrow(() -> new OrderNotFoundException(id));

// BAD — パラメータとしての Optional
public void process(Optional<String> name) {}
```

## エラーハンドリング

- ドメインエラーには非検査例外を優先
- `RuntimeException` を継承するドメイン固有の例外を作成
- トップレベルハンドラ以外では広範な `catch (Exception e)` を避ける
- 例外メッセージにはコンテキストを含める

```java
public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(Long id) {
        super("Order not found: id=" + id);
    }
}
```

## Streams

- 変換には Stream を使用; パイプラインは短く保つ（最大 3-4 操作）
- 可読性がある場合はメソッド参照を優先: `.map(Order::getTotal)`
- Stream 操作内での副作用を避ける
- 複雑なロジックの場合、入り組んだ Stream パイプラインよりもループを優先

## リファレンス

完全なコーディング標準と例については、スキル: `java-coding-standards` を参照。
JPA/Hibernate エンティティ設計パターンについては、スキル: `jpa-patterns` を参照。
