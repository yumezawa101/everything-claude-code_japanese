---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift テスト

> このファイルは [common/testing.md](../common/testing.md) を Swift 固有のコンテンツで拡張します。

## フレームワーク

新しいテストには **Swift Testing**（`import Testing`）を使用。`@Test` と `#expect` を使用:

```swift
@Test("User creation validates email")
func userCreationValidatesEmail() throws {
    #expect(throws: ValidationError.invalidEmail) {
        try User(email: "not-an-email")
    }
}
```

## テストの分離

各テストはフレッシュなインスタンスを取得 -- `init` でセットアップ、`deinit` でティアダウン。テスト間で共有のミュータブル状態を持たない。

## パラメータ化テスト

```swift
@Test("Validates formats", arguments: ["json", "xml", "csv"])
func validatesFormat(format: String) throws {
    let parser = try Parser(format: format)
    #expect(parser.isValid)
}
```

## カバレッジ

```bash
swift test --enable-code-coverage
```

## リファレンス

Swift Testing によるプロトコルベースの依存性注入とモックパターンについては、スキル: `swift-protocol-di-testing` を参照。
