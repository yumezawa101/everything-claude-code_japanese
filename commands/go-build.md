---
description: Go ビルドエラー、go vet 警告、リンター問題を段階的に修正します。最小限の外科的修正のために go-build-resolver エージェントを呼び出します。
---

# Go Build and Fix

このコマンドは **go-build-resolver** エージェントを呼び出し、最小限の変更で Go ビルドエラーを段階的に修正します。

## このコマンドの機能

1. **診断の実行**: `go build`、`go vet`、`staticcheck` を実行
2. **エラーの解析**: ファイル別にグループ化し重大度順にソート
3. **段階的修正**: 一度に1つのエラーを修正
4. **各修正の検証**: 各変更後にビルドを再実行
5. **サマリーの報告**: 修正されたものと残っているものを表示

## 使用するタイミング

以下の場合に `/go-build` を使用:
- `go build ./...` がエラーで失敗する場合
- `go vet ./...` が問題を報告する場合
- `golangci-lint run` が警告を表示する場合
- モジュール依存関係が壊れている場合
- ビルドを壊す変更をプルした後

## 実行される診断コマンド

```bash
# プライマリビルドチェック
go build ./...

# 静的解析
go vet ./...

# 拡張リンティング（利用可能な場合）
staticcheck ./...
golangci-lint run

# モジュール問題
go mod verify
go mod tidy -v
```

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `undefined: X` | import を追加またはタイプミスを修正 |
| `cannot use X as Y` | 型変換または代入を修正 |
| `missing return` | return 文を追加 |
| `X does not implement Y` | 欠落しているメソッドを追加 |
| `import cycle` | パッケージを再構築 |
| `declared but not used` | 変数を削除または使用 |
| `cannot find package` | `go get` または `go mod tidy` |

## 修正戦略

1. **まずビルドエラー** - コードがコンパイルできる必要がある
2. **次に vet 警告** - 疑わしい構造を修正
3. **最後に lint 警告** - スタイルとベストプラクティス
4. **一度に1つの修正** - 各変更を検証
5. **最小限の変更** - リファクタリングではなく修正のみ

## 停止条件

以下の場合、エージェントは停止して報告:
- 同じエラーが3回の試行後も持続
- 修正がさらなるエラーを引き起こす
- アーキテクチャの変更が必要
- 外部依存関係が欠落

## 関連コマンド

- `/go-test` - ビルド成功後にテストを実行
- `/go-review` - コード品質をレビュー
- `/verify` - 完全な検証ループ

## 関連

- Agent: `agents/go-build-resolver.md`
- Skill: `skills/golang-patterns/`
