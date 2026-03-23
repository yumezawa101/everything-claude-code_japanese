---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift パターン

> このファイルは [common/patterns.md](../common/patterns.md) を Swift 固有のコンテンツで拡張します。

## プロトコル指向設計

小さく焦点を絞ったプロトコルを定義。共有デフォルトにはプロトコル拡張を使用:

```swift
protocol Repository: Sendable {
    associatedtype Item: Identifiable & Sendable
    func find(by id: Item.ID) async throws -> Item?
    func save(_ item: Item) async throws
}
```

## 値型

- データ転送オブジェクトとモデルには struct を使用
- 異なる状態をモデル化するために関連値付き enum を使用:

```swift
enum LoadState<T: Sendable>: Sendable {
    case idle
    case loading
    case loaded(T)
    case failed(Error)
}
```

## Actor パターン

ロックやディスパッチキューの代わりに、共有ミュータブル状態には Actor を使用:

```swift
actor Cache<Key: Hashable & Sendable, Value: Sendable> {
    private var storage: [Key: Value] = [:]

    func get(_ key: Key) -> Value? { storage[key] }
    func set(_ key: Key, value: Value) { storage[key] = value }
}
```

## 依存性注入

デフォルトパラメータ付きでプロトコルを注入 -- 本番環境はデフォルトを使用、テストはモックを注入:

```swift
struct UserService {
    private let repository: any UserRepository

    init(repository: any UserRepository = DefaultUserRepository()) {
        self.repository = repository
    }
}
```

## リファレンス

Actor ベースの永続化パターンについては、スキル: `swift-actor-persistence` を参照。
プロトコルベースの DI とテストについては、スキル: `swift-protocol-di-testing` を参照。
