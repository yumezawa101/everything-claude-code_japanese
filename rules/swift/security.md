---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift セキュリティ

> このファイルは [common/security.md](../common/security.md) を Swift 固有のコンテンツで拡張します。

## シークレット管理

- 機密データ（トークン、パスワード、キー）には **Keychain Services** を使用 -- `UserDefaults` は使用しない
- ビルド時のシークレットには環境変数または `.xcconfig` ファイルを使用
- ソースコードにシークレットをハードコードしない -- デコンパイルツールで容易に抽出される

```swift
let apiKey = ProcessInfo.processInfo.environment["API_KEY"]
guard let apiKey, !apiKey.isEmpty else {
    fatalError("API_KEY not configured")
}
```

## トランスポートセキュリティ

- App Transport Security（ATS）はデフォルトで強制 -- 無効化しない
- 重要なエンドポイントには証明書ピンニングを使用
- すべてのサーバー証明書をバリデーション

## 入力バリデーション

- インジェクション防止のためにすべてのユーザー入力を表示前にサニタイズ
- 強制アンラップではなくバリデーション付きの `URL(string:)` を使用
- 外部ソース（API、ディープリンク、ペーストボード）からのデータは処理前にバリデーション
