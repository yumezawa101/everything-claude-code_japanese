---
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# Kotlin コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Kotlin 固有のコンテンツで拡張します。

## フォーマット

- **ktlint** または **Detekt** でスタイルを強制
- 公式 Kotlin コードスタイル（`gradle.properties` に `kotlin.code.style=official`）

## イミュータビリティ

- `var` より `val` を優先 -- デフォルトで `val` を使用し、ミューテーションが必要な場合のみ `var` を使用
- 値型には `data class` を使用; public API ではイミュータブルコレクション（`List`、`Map`、`Set`）を使用
- 状態更新にはコピーオンライト: `state.copy(field = newValue)`

## 命名規則

Kotlin の規約に従う:
- `camelCase`: 関数とプロパティ
- `PascalCase`: クラス、インターフェース、オブジェクト、型エイリアス
- `SCREAMING_SNAKE_CASE`: 定数（`const val` または `@JvmStatic`）
- インターフェースは `I` ではなく振る舞いを接頭辞に: `IClickable` ではなく `Clickable`

## Null 安全

- `!!` は使用しない -- `?.`、`?:`、`requireNotNull()`、`checkNotNull()` を優先
- スコープ付き null 安全操作には `?.let {}` を使用
- 正当に結果がない可能性のある関数からは nullable 型を返す

```kotlin
// BAD
val name = user!!.name

// GOOD
val name = user?.name ?: "Unknown"
val name = requireNotNull(user) { "User must be set before accessing name" }.name
```

## Sealed 型

閉じた状態階層をモデル化するために sealed class/interface を使用:

```kotlin
sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}
```

sealed 型では常に網羅的な `when` を使用 -- `else` ブランチは使わない。

## 拡張関数

ユーティリティ操作に拡張関数を使用するが、発見しやすく保つ:
- レシーバ型にちなんだファイル名に配置（`StringExt.kt`、`FlowExt.kt`）
- スコープを限定 -- `Any` や過度に汎用的な型に拡張を追加しない

## スコープ関数

適切なスコープ関数を使用:
- `let` -- null チェック + 変換: `user?.let { greet(it) }`
- `run` -- レシーバを使って結果を計算: `service.run { fetch(config) }`
- `apply` -- オブジェクトを設定: `builder.apply { timeout = 30 }`
- `also` -- 副作用: `result.also { log(it) }`
- スコープ関数の深いネストを避ける（最大 2 レベル）

## エラーハンドリング

- `Result<T>` またはカスタム sealed 型を使用
- throwable コードのラッピングに `runCatching {}` を使用
- `CancellationException` を絶対にキャッチしない -- 常に再スローする
- 制御フローのための `try-catch` を避ける

```kotlin
// BAD — 制御フローに例外を使用
val user = try { repository.getUser(id) } catch (e: NotFoundException) { null }

// GOOD — nullable リターン
val user: User? = repository.findUser(id)
```
