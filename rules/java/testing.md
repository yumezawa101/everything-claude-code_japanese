---
paths:
  - "**/*.java"
---
# Java テスト

> このファイルは [common/testing.md](../common/testing.md) を Java 固有のコンテンツで拡張します。

## テストフレームワーク

- **JUnit 5**（`@Test`、`@ParameterizedTest`、`@Nested`、`@DisplayName`）
- **AssertJ** で流暢なアサーション（`assertThat(result).isEqualTo(expected)`）
- **Mockito** で依存関係のモック
- **Testcontainers** でデータベースやサービスを必要とするインテグレーションテスト

## テストの整理

```
src/test/java/com/example/app/
  service/           # Service レイヤーのユニットテスト
  controller/        # Web レイヤー / API テスト
  repository/        # データアクセステスト
  integration/       # クロスレイヤーインテグレーションテスト
```

`src/test/java` で `src/main/java` のパッケージ構造をミラーリングする。

## ユニットテストパターン

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository);
    }

    @Test
    @DisplayName("findById returns order when exists")
    void findById_existingOrder_returnsOrder() {
        var order = new Order(1L, "Alice", BigDecimal.TEN);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        var result = orderService.findById(1L);

        assertThat(result.customerName()).isEqualTo("Alice");
        verify(orderRepository).findById(1L);
    }

    @Test
    @DisplayName("findById throws when order not found")
    void findById_missingOrder_throws() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.findById(99L))
            .isInstanceOf(OrderNotFoundException.class)
            .hasMessageContaining("99");
    }
}
```

## パラメータ化テスト

```java
@ParameterizedTest
@CsvSource({
    "100.00, 10, 90.00",
    "50.00, 0, 50.00",
    "200.00, 25, 150.00"
})
@DisplayName("discount applied correctly")
void applyDiscount(BigDecimal price, int pct, BigDecimal expected) {
    assertThat(PricingUtils.discount(price, pct)).isEqualByComparingTo(expected);
}
```

## インテグレーションテスト

実際のデータベースとのインテグレーションに Testcontainers を使用:

```java
@Testcontainers
class OrderRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    private OrderRepository repository;

    @BeforeEach
    void setUp() {
        var dataSource = new PGSimpleDataSource();
        dataSource.setUrl(postgres.getJdbcUrl());
        dataSource.setUser(postgres.getUsername());
        dataSource.setPassword(postgres.getPassword());
        repository = new JdbcOrderRepository(dataSource);
    }

    @Test
    void save_and_findById() {
        var saved = repository.save(new Order(null, "Bob", BigDecimal.ONE));
        var found = repository.findById(saved.getId());
        assertThat(found).isPresent();
    }
}
```

Spring Boot インテグレーションテストについては、スキル: `springboot-tdd` を参照。

## テスト命名

`@DisplayName` を使用した記述的な名前:
- メソッド名は `methodName_scenario_expectedBehavior()` 形式
- レポート用に `@DisplayName("人間が読める説明")` を使用

## カバレッジ

- 80%以上の行カバレッジを目標
- カバレッジレポートに JaCoCo を使用
- Service とドメインロジックに集中 -- 簡単な getter や設定クラスはスキップ

## リファレンス

MockMvc と Testcontainers を使用した Spring Boot TDD パターンについては、スキル: `springboot-tdd` を参照。
テストに関する期待事項については、スキル: `java-coding-standards` を参照。
