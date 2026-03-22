---
description: Kotlin の TDD ワークフローを適用します。Kotest テストを最初に記述し、その後実装します。Kover で 80% 以上のカバレッジを確認します。
---

# Kotlin TDD コマンド

このコマンドは Kotest、MockK、Kover を使用した Kotlin コードのテスト駆動開発手法を適用します。

## このコマンドの機能

1. **型/インターフェースの定義**: 関数シグネチャを最初にスキャフォールディング
2. **Kotest テストの作成**: 包括的なテストスペックを作成（RED）
3. **テストの実行**: テストが正しい理由で失敗することを確認
4. **コードの実装**: テストをパスするための最小限のコードを記述（GREEN）
5. **リファクタリング**: テストをグリーンに保ちながら改善
6. **カバレッジの確認**: Kover で 80% 以上のカバレッジを保証

## 使用するタイミング

以下の場合に `/kotlin-test` を使用:
- 新しい Kotlin 関数やクラスの実装時
- 既存 Kotlin コードへのテストカバレッジ追加時
- バグ修正時（失敗するテストを最初に作成）
- 重要なビジネスロジックの構築時
- Kotlin での TDD ワークフローの学習時

## TDD サイクル

```
RED     -> 失敗する Kotest テストを作成
GREEN   -> テストをパスするための最小限のコードを実装
REFACTOR -> コードを改善、テストはグリーンを保持
REPEAT  -> 次のテストケースへ
```

## テストパターン

### StringSpec（最もシンプル）

```kotlin
class CalculatorTest : StringSpec({
    "add two positive numbers" {
        Calculator.add(2, 3) shouldBe 5
    }
})
```

### BehaviorSpec（BDD）

```kotlin
class OrderServiceTest : BehaviorSpec({
    Given("a valid order") {
        When("placed") {
            Then("should be confirmed") { /* ... */ }
        }
    }
})
```

### データ駆動テスト

```kotlin
class ParserTest : FunSpec({
    context("valid inputs") {
        withData("2026-01-15", "2026-12-31", "2000-01-01") { input ->
            parseDate(input).shouldNotBeNull()
        }
    }
})
```

### コルーチンテスト

```kotlin
class AsyncServiceTest : FunSpec({
    test("concurrent fetch completes") {
        runTest {
            val result = service.fetchAll()
            result.shouldNotBeEmpty()
        }
    }
})
```

## カバレッジコマンド

```bash
# カバレッジ付きテスト実行
./gradlew koverHtmlReport

# カバレッジ閾値の検証
./gradlew koverVerify

# CI 用 XML レポート
./gradlew koverXmlReport

# HTML レポートを開く
open build/reports/kover/html/index.html

# 特定のテストクラスを実行
./gradlew test --tests "com.example.UserServiceTest"

# 詳細出力で実行
./gradlew test --info
```

## カバレッジ目標

| コードタイプ | 目標 |
|-----------|--------|
| 重要なビジネスロジック | 100% |
| パブリック API | 90%+ |
| 一般的なコード | 80%+ |
| 生成されたコード | 除外 |

## TDD ベストプラクティス

**推奨事項:**
- 実装前にテストを最初に書く
- 各変更後にテストを実行
- 表現力豊かなアサーションのために Kotest マッチャーを使用
- suspend 関数には MockK の `coEvery`/`coVerify` を使用
- 実装の詳細ではなく動作をテスト
- エッジケースを含める（空、null、最大値）

**避けるべき事項:**
- テストの前に実装を書く
- RED フェーズをスキップ
- プライベート関数を直接テスト
- コルーチンテストで `Thread.sleep()` を使用
- 不安定なテストを無視

## 関連コマンド

- `/kotlin-build` - ビルドエラーの修正
- `/kotlin-review` - 実装後のコードレビュー
- `/verify` - 完全な検証ループ

## 関連

- Skill: `skills/kotlin-testing/`
- Skill: `skills/tdd-workflow/`
