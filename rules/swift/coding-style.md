---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Swift 固有のコンテンツで拡張します。

## フォーマット

- **SwiftFormat** で自動フォーマット、**SwiftLint** でスタイル強制
- Xcode 16+ には代替として `swift-format` が同梱

## イミュータビリティ

- `var` より `let` を優先 -- すべてを `let` で定義し、コンパイラが要求する場合のみ `var` に変更
- デフォルトで値セマンティクスの `struct` を使用; アイデンティティや参照セマンティクスが必要な場合のみ `class` を使用

## 命名規則

[Apple API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/) に従う:

- 使用時の明確さ -- 不必要な単語は省略
- メソッドやプロパティは型ではなく役割で名前を付ける
- グローバル定数よりも `static let` を使用

## エラーハンドリング

型付き throws（Swift 6+）とパターンマッチングを使用:

```swift
func load(id: String) throws(LoadError) -> Item {
    guard let data = try? read(from: path) else {
        throw .fileNotFound(id)
    }
    return try decode(data)
}
```

## 並行処理

Swift 6 の厳密な並行処理チェックを有効化。以下を優先:

- 分離境界を越えるデータには `Sendable` 値型
- 共有ミュータブル状態には Actor
- 非構造化 `Task {}` よりも構造化並行処理（`async let`、`TaskGroup`）
