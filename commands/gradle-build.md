---
description: Android および KMP プロジェクトの Gradle ビルドエラーを修正します
---

# Gradle Build Fix

Android および Kotlin Multiplatform プロジェクトの Gradle ビルド・コンパイルエラーを段階的に修正します。

## ステップ 1: ビルド設定の検出

プロジェクトタイプを特定し適切なビルドを実行:

| 指標 | ビルドコマンド |
|-----------|---------------|
| `build.gradle.kts` + `composeApp/` (KMP) | `./gradlew composeApp:compileKotlinMetadata 2>&1` |
| `build.gradle.kts` + `app/` (Android) | `./gradlew app:compileDebugKotlin 2>&1` |
| `settings.gradle.kts` にモジュール | `./gradlew assemble 2>&1` |
| Detekt 設定済み | `./gradlew detekt 2>&1` |

`gradle.properties` と `local.properties` の設定も確認。

## ステップ 2: エラーの解析とグループ化

1. ビルドコマンドを実行して出力をキャプチャ
2. Kotlin コンパイルエラーと Gradle 設定エラーを分離
3. モジュールとファイルパスでグループ化
4. ソート: 設定エラーを先に、次にコンパイルエラーを依存関係順に

## ステップ 3: 修正ループ

各エラーについて:

1. **ファイルを読む** -- エラー行の周辺コンテキスト全体
2. **診断** -- 一般的なカテゴリ:
   - import 欠落または未解決参照
   - 型の不一致または互換性のない型
   - `build.gradle.kts` の依存関係欠落
   - expect/actual の不一致（KMP）
   - Compose コンパイラエラー
3. **最小限の修正** -- エラーを解決する最小の変更
4. **ビルド再実行** -- 修正を確認し新しいエラーをチェック
5. **続行** -- 次のエラーへ

## ステップ 4: ガードレール

以下の場合は停止してユーザーに確認:
- 修正が解決するより多くのエラーを導入
- 同じエラーが3回の試行後も持続
- エラーに新しい依存関係の追加やモジュール構造の変更が必要
- Gradle sync 自体が失敗（設定フェーズエラー）
- エラーが生成コード内（Room、SQLDelight、KSP）

## ステップ 5: サマリー

報告:
- 修正されたエラー（モジュール、ファイル、説明）
- 残存エラー
- 新たに導入されたエラー（ゼロであるべき）
- 推奨次ステップ

## 一般的な Gradle/KMP 修正

| エラー | 修正 |
|-------|-----|
| `commonMain` の未解決参照 | 依存関係が `commonMain.dependencies {}` にあるか確認 |
| actual のない expect 宣言 | 各プラットフォームソースセットに `actual` 実装を追加 |
| Compose コンパイラバージョンの不一致 | `libs.versions.toml` で Kotlin と Compose コンパイラバージョンを整合 |
| 重複クラス | `./gradlew dependencies` で競合する依存関係を確認 |
| KSP エラー | `./gradlew kspCommonMainKotlinMetadata` を実行して再生成 |
| Configuration cache の問題 | シリアライズ不可能なタスク入力を確認 |
