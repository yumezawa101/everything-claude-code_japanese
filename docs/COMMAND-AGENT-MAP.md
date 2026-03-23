# コマンド → Agent / スキル マップ

本ドキュメントは、各スラッシュコマンドとそれが呼び出す主要 agent やスキル、および注目すべき直接呼び出し agent をリストします。どのコマンドがどの agent を使用するかを把握し、リファクタリングの一貫性を保つために使用してください。

| コマンド | 主要 agent | 備考 |
|---------|------------------|--------|
| `/plan` | planner | コーディング前の実装計画 |
| `/tdd` | tdd-guide | テスト駆動開発 |
| `/code-review` | code-reviewer | 品質とセキュリティレビュー |
| `/build-fix` | build-error-resolver | ビルド/型エラーの修正 |
| `/e2e` | e2e-runner | Playwright E2E テスト |
| `/refactor-clean` | refactor-cleaner | デッドコードの除去 |
| `/update-docs` | doc-updater | ドキュメントの同期 |
| `/update-codemaps` | doc-updater | コードマップ / アーキテクチャドキュメント |
| `/go-review` | go-reviewer | Go コードレビュー |
| `/go-test` | tdd-guide | Go TDD ワークフロー |
| `/go-build` | go-build-resolver | Go ビルドエラーの修正 |
| `/python-review` | python-reviewer | Python コードレビュー |
| `/harness-audit` | -- | ハーネススコアカード（単一 agent なし） |
| `/loop-start` | loop-operator | 自律ループの開始 |
| `/loop-status` | loop-operator | ループ状態の確認 |
| `/quality-gate` | -- | 品質パイプライン（hook 的） |
| `/model-route` | -- | モデル推奨（agent なし） |
| `/orchestrate` | planner, tdd-guide, code-reviewer, security-reviewer, architect | マルチ agent ハンドオフ |
| `/multi-plan` | architect (Codex/Gemini プロンプト) | マルチモデル計画 |
| `/multi-execute` | architect / frontend プロンプト | マルチモデル実行 |
| `/multi-backend` | architect | バックエンドマルチサービス |
| `/multi-frontend` | architect | フロントエンドマルチサービス |
| `/multi-workflow` | architect | 汎用マルチサービス |
| `/learn` | -- | continuous-learning スキル、instincts |
| `/learn-eval` | -- | continuous-learning-v2、評価後に保存 |
| `/instinct-status` | -- | continuous-learning-v2 |
| `/instinct-import` | -- | continuous-learning-v2 |
| `/instinct-export` | -- | continuous-learning-v2 |
| `/evolve` | -- | continuous-learning-v2、instincts のクラスタリング |
| `/promote` | -- | continuous-learning-v2 |
| `/projects` | -- | continuous-learning-v2 |
| `/skill-create` | -- | skill-create-output スクリプト、git 履歴 |
| `/checkpoint` | -- | verification-loop スキル |
| `/verify` | -- | verification-loop スキル |
| `/eval` | -- | eval-harness スキル |
| `/test-coverage` | -- | カバレッジ分析 |
| `/sessions` | -- | セッション履歴 |
| `/setup-pm` | -- | パッケージマネージャセットアップスクリプト |
| `/claw` | -- | NanoClaw CLI (scripts/claw.js) |
| `/pm2` | -- | PM2 サービスライフサイクル |
| `/security-scan` | security-reviewer (スキル) | security-scan スキル経由の AgentShield |

## 直接使用 Agent

| 直接 agent | 目的 | スコープ | 備考 |
|--------------|---------|-------|-------|
| `typescript-reviewer` | TypeScript/JavaScript コードレビュー | TypeScript/JavaScript プロジェクト | レビューで TS/JS 固有の指摘が必要で、専用のスラッシュコマンドがまだない場合に、この agent を直接呼び出してください。 |

## コマンドが参照するスキル

- **continuous-learning**, **continuous-learning-v2**: `/learn`, `/learn-eval`, `/instinct-*`, `/evolve`, `/promote`, `/projects`
- **verification-loop**: `/checkpoint`, `/verify`
- **eval-harness**: `/eval`
- **security-scan**: `/security-scan` (AgentShield を実行)
- **strategic-compact**: コンパクションポイントで提案（hooks）

## このマップの使い方

- **発見可能性:** どのコマンドがどの agent を起動するかを検索（例: 「code-reviewer には `/code-review` を使用」）。
- **リファクタリング:** agent の名前変更や削除時に、このドキュメントとコマンドファイルで参照を検索。
- **CI/ドキュメント:** カタログスクリプト（`node scripts/ci/catalog.js`）は agent/コマンド/スキル数を出力します。このマップはコマンドと agent の関係を補完します。
