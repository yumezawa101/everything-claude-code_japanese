---
description: Kotlin/Gradle ビルドエラー、コンパイラ警告、依存関係の問題を段階的に修正します。最小限の外科的修正のために kotlin-build-resolver エージェントを呼び出します。
---

# Kotlin Build and Fix

このコマンドは **kotlin-build-resolver** エージェントを呼び出し、最小限の変更で Kotlin ビルドエラーを段階的に修正します。

## このコマンドの機能

1. **診断の実行**: `./gradlew build`、`detekt`、`ktlintCheck` を実行
2. **エラーの解析**: ファイル別にグループ化し重大度順にソート
3. **段階的修正**: 一度に1つのエラーを修正
4. **各修正の検証**: 各変更後にビルドを再実行
5. **サマリーの報告**: 修正されたものと残っているものを表示

## 使用するタイミング

以下の場合に `/kotlin-build` を使用:
- `./gradlew build` がエラーで失敗する場合
- Kotlin コンパイラがエラーを報告する場合
- `./gradlew detekt` が違反を報告する場合
- Gradle 依存関係の解決が失敗する場合
- ビルドを壊す変更をプルした後

## 実行される診断コマンド

```bash
# プライマリビルドチェック
./gradlew build 2>&1

# 静的解析
./gradlew detekt 2>&1 || echo "detekt not configured"
./gradlew ktlintCheck 2>&1 || echo "ktlint not configured"

# 依存関係の問題
./gradlew dependencies --configuration runtimeClasspath 2>&1 | head -100

# キャッシュや依存関係メタデータが疑わしい場合のディープリフレッシュ（オプション）
./gradlew build --refresh-dependencies
```

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `Unresolved reference: X` | import または依存関係を追加 |
| `Type mismatch` | 型変換または代入を修正 |
| `'when' must be exhaustive` | sealed class の欠落ブランチを追加 |
| `Suspend function can only be called from coroutine` | `suspend` 修飾子を追加 |
| `Smart cast impossible` | ローカル `val` または `let` を使用 |
| `None of the following candidates is applicable` | 引数の型を修正 |
| `Could not resolve dependency` | バージョンを修正またはリポジトリを追加 |

## 修正戦略

1. **まずビルドエラー** - コードがコンパイルできる必要がある
2. **次に Detekt 違反** - コード品質の問題を修正
3. **最後に ktlint 警告** - フォーマットを修正
4. **一度に1つの修正** - 各変更を検証
5. **最小限の変更** - リファクタリングではなく修正のみ

## 停止条件

以下の場合、エージェントは停止して報告:
- 同じエラーが3回の試行後も持続
- 修正がさらなるエラーを引き起こす
- アーキテクチャの変更が必要
- 外部依存関係が欠落

## 関連コマンド

- `/kotlin-test` - ビルド成功後にテストを実行
- `/kotlin-review` - コード品質をレビュー
- `/verify` - 完全な検証ループ

## 関連

- Agent: `agents/kotlin-build-resolver.md`
- Skill: `skills/kotlin-patterns/`
