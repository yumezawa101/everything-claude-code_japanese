---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go テスト

> このファイルは [common/testing.md](../common/testing.md) を Go 固有のコンテンツで拡張します。

## フレームワーク

標準の `go test` と **テーブル駆動テスト** を使用。

## 競合検出

常に `-race` フラグを付けて実行:

```bash
go test -race ./...
```

## カバレッジ

```bash
go test -cover ./...
```

## リファレンス

詳細な Go テストパターンとヘルパーについては、スキル: `golang-testing` を参照。
