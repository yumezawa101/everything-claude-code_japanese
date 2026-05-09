---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Go 固有のコンテンツで拡張します。

## フォーマット

- **gofmt** と **goimports** は必須 -- スタイルに関する議論は不要

## 設計原則

- インターフェースを受け取り、構造体を返す
- インターフェースは小さく保つ（1-3 メソッド）

## エラーハンドリング

常にコンテキスト付きでエラーをラップする:

```go
if err != nil {
    return fmt.Errorf("failed to create user: %w", err)
}
```

## リファレンス

包括的な Go イディオムとパターンについては、スキル: `golang-patterns` を参照。
