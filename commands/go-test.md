---
description: Go のテスト駆動開発（TDD）ワークフローを適用します。テーブル駆動テストを最初に記述し、その後実装します。go test -cover で 80% 以上のカバレッジを確認します。
---

# Go TDD コマンド

このコマンドは Go のイディオム的なテストパターンを使用したテスト駆動開発手法を適用します。

## このコマンドの機能

1. **型/インターフェースの定義**: 関数シグネチャを最初にスキャフォールディング
2. **テーブル駆動テストの作成**: 包括的なテストケースを作成（RED）
3. **テストの実行**: テストが正しい理由で失敗することを確認
4. **コードの実装**: テストをパスするための最小限のコードを記述（GREEN）
5. **リファクタリング**: テストをグリーンに保ちながら改善
6. **カバレッジの確認**: 80% 以上のカバレッジを保証

## 使用するタイミング

以下の場合に `/go-test` を使用:
- 新しい Go 関数の実装時
- 既存コードへのテストカバレッジ追加時
- バグ修正時（失敗するテストを最初に作成）
- 重要なビジネスロジックの構築時
- Go での TDD ワークフローの学習時

## TDD サイクル

```
RED     → 失敗するテーブル駆動テストを作成
GREEN   → テストをパスするための最小限のコードを実装
REFACTOR → コードを改善、テストはグリーンを保持
REPEAT  → 次のテストケースへ
```

## テストパターン

### テーブル駆動テスト
```go
tests := []struct {
    name     string
    input    InputType
    want     OutputType
    wantErr  bool
}{
    {"case 1", input1, want1, false},
    {"case 2", input2, want2, true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Function(tt.input)
        // assertions
    })
}
```

### 並列テスト
```go
for _, tt := range tests {
    tt := tt // Capture
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        // test body
    })
}
```

### テストヘルパー
```go
func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()
    db := createDB()
    t.Cleanup(func() { db.Close() })
    return db
}
```

## カバレッジコマンド

```bash
# 基本的なカバレッジ
go test -cover ./...

# カバレッジプロファイル
go test -coverprofile=coverage.out ./...

# ブラウザで表示
go tool cover -html=coverage.out

# 関数ごとのカバレッジ
go tool cover -func=coverage.out

# レース検出付き
go test -race -cover ./...
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
- 包括的なカバレッジのためにテーブル駆動テストを使用
- 実装の詳細ではなく動作をテスト
- エッジケースを含める（空、nil、最大値）

**避けるべき事項:**
- テストの前に実装を書く
- RED フェーズをスキップ
- プライベート関数を直接テスト
- テストで `time.Sleep` を使用
- 不安定なテストを無視

## 関連コマンド

- `/go-build` - ビルドエラーの修正
- `/go-review` - 実装後のコードレビュー
- `/verify` - 完全な検証ループ

## 関連

- Skill: `skills/golang-testing/`
- Skill: `skills/tdd-workflow/`
