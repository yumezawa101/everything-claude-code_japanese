# Model Route コマンド

複雑さと予算に基づいて、現在のタスクに最適なモデルティアを推奨します。

## 使用方法

`/model-route [task-description] [--budget low|med|high]`

## ルーティングヒューリスティック

- `haiku`: 決定論的でリスクの低い機械的変更
- `sonnet`: 実装とリファクタリングのデフォルト
- `opus`: アーキテクチャ、深いレビュー、曖昧な要件

## 必須出力

- 推奨モデル
- 信頼度レベル
- このモデルが適する理由
- 最初の試行が失敗した場合のフォールバックモデル

## 引数

$ARGUMENTS:
- `[task-description]` オプションのフリーテキスト
- `--budget low|med|high` オプション
