# PR レビューとキュートリアージ -- 2026年3月13日

## スナップショット

本ドキュメントは、`2026-03-13T08:33:31Z` 時点での `everything-claude-code` プルリクエストキューのライブ GitHub トリアージスナップショットを記録します。

使用したソース:

- `gh pr view`
- `gh pr checks`
- `gh pr diff --name-only`
- マージ済み `#399` head に対するターゲットを絞ったローカル検証

このパスで使用したスタール閾値:

- `2026-02-11 以前に最終更新`（2026年3月13日の `30` 日以上前）

## PR `#399` 事後レビュー

PR:

- `#399` -- `fix(observe): 5-layer automated session guard to prevent self-loop observations`
- 状態: `MERGED`
- マージ日時: `2026-03-13T06:40:03Z`
- マージコミット: `c52a28ace9e7e84c00309fc7b629955dfc46ecf9`

変更ファイル:

- `skills/continuous-learning-v2/hooks/observe.sh`
- `skills/continuous-learning-v2/agents/observer-loop.sh`

マージ済み head `546628182200c16cc222b97673ddd79e942eacce` に対して実施した検証:

- 変更された両方のシェルスクリプトに対する `bash -n`
- `node tests/hooks/hooks.test.js`（`204` パス、`0` 失敗）
- 以下に対するターゲットを絞った hook 呼び出し:
  - インタラクティブ CLI セッション
  - `CLAUDE_CODE_ENTRYPOINT=mcp`
  - `ECC_HOOK_PROFILE=minimal`
  - `ECC_SKIP_OBSERVE=1`
  - `agent_id` ペイロード
  - トリミングされた `ECC_OBSERVE_SKIP_PATHS`

動作結果:

- コアの自己ループ修正は動作
- 自動セッションガードブランチは意図通りに観察書き込みを抑制
- 最終的な `non-cli => exit` エントリポイントロジックは正しいフェイルクローズ形状

残存する指摘事項:

1. 中程度: スキップされた自動セッションは、新しいガードが exit する前に homunculus プロジェクト状態を依然として作成する。
   `observe.sh` は自動セッションガードブロックに到達する前に `cwd` を解決し、プロジェクト検出をソースするため、`detect-project.sh` は後で早期 exit するセッションに対しても `projects/<id>/...` ディレクトリを作成し `projects.json` を更新する。
2. 低: 新しいガードマトリックスは直接的なリグレッションカバレッジなしで出荷された。
   hook テストスイートは隣接する動作を引き続き検証するが、新しい `CLAUDE_CODE_ENTRYPOINT`、`ECC_HOOK_PROFILE`、`ECC_SKIP_OBSERVE`、`agent_id`、またはトリミングされたスキップパスブランチを直接アサートしない。

判定:

- `#399` はその主要な目標に対して技術的に正しく、緊急のループ停止修正として安全にマージできた。
- 自動セッションガードをプロジェクト登録の副作用より前に移動し、明示的なガードパステストを追加するためのフォローアップ Issue またはパッチがまだ必要。

## オープン PR インベントリ

現在 `4` 件のオープン PR があります。

### キューテーブル

| PR | タイトル | ドラフト | マージ可能 | マージ状態 | 更新日時 | スタール | 現在の判定 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `#292` | `chore(config): governance and config foundation (PR #272 split 1/6)` | `false` | `MERGEABLE` | `UNSTABLE` | `2026-03-13T07:26:55Z` | `No` | `現在の最有力マージ候補` |
| `#298` | `feat(agents,skills,rules): add Rust, Java, mobile, DevOps, and performance content` | `false` | `CONFLICTING` | `DIRTY` | `2026-03-11T04:29:07Z` | `No` | `レビュー完了前に変更が必要` |
| `#336` | `Customisation for Codex CLI - Features from Claude Code and OpenCode` | `true` | `MERGEABLE` | `UNSTABLE` | `2026-03-13T07:26:12Z` | `No` | `手動レビューとドラフト解除が必要` |
| `#420` | `feat: add laravel skills` | `true` | `MERGEABLE` | `UNSTABLE` | `2026-03-12T22:57:36Z` | `No` | `低リスクドラフト、ドラフト解除後にレビュー` |

`最終更新が30日以上前` ルールによるスタール PR は現在ありません。

## PR 別アセスメント

### `#292` -- ガバナンス / 設定基盤

ライブ状態:

- オープン
- 非ドラフト
- `MERGEABLE`
- マージ状態 `UNSTABLE`
- 確認できるチェック:
  - `CodeRabbit` パス
  - `GitGuardian Security Checks` パス

スコープ:

- `.env.example`
- `.github/ISSUE_TEMPLATE/copilot-task.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.gitignore`
- `.markdownlint.json`
- `.tool-versions`
- `VERSION`

アセスメント:

- 現在のキューで最もクリーンなマージ候補。
- ブランチは既に現在の `main` にリフレッシュ済み。
- 現在可視のボットフィードバックはマージブロッキングではなく、マイナー/nit レベル。
- 主な注意点は、現在の PR チェック出力に GitHub Actions マトリックスランが表示されていないこと。

現在の推奨:

- `オーナーによる最終パス後にマージ可能。`
- 保守的なパスを取りたい場合は、マージ前に残りの `.env.example`、PR テンプレート、`.tool-versions` の nit を簡単にヒューマンレビュー。

### `#298` -- 大規模マルチドメインコンテンツ拡張

ライブ状態:

- オープン
- 非ドラフト
- `CONFLICTING`
- マージ状態 `DIRTY`
- 確認できるチェック:
  - `CodeRabbit` パス
  - `GitGuardian Security Checks` パス
  - `cubic · AI code reviewer` パス

スコープ:

- `35` ファイル
- Java、Rust、モバイル、DevOps、パフォーマンス、データ、MLOps にわたる大規模なドキュメントとスキル/ルール拡張

アセスメント:

- この PR はマージの準備ができていない。
- 現在の `main` とコンフリクトしているため、ブランチレベルでもマージ不可能。
- cubic が現在のレビューで `35` ファイルにわたる `34` 件の問題を特定。それらの指摘はスタイルクリーンアップだけでなく、実質的で技術的なものであり、複数の新しいスキルにわたる壊れたまたは誤解を招く例をカバー。
- コンフリクトがなくても、スコープが大きすぎるため、クイックマージ判断ではなく意図的なコンテンツ修正パスが必要。

現在の推奨:

- `変更が必要。`
- まず rebase またはリスタックし、次に実質的なサンプル品質の問題を解決。
- モメンタムが重要な場合は、1つの非常に大きな PR を維持するのではなくドメインごとに分割。

### `#336` -- Codex CLI カスタマイゼーション

ライブ状態:

- オープン
- ドラフト
- `MERGEABLE`
- マージ状態 `UNSTABLE`
- 確認できるチェック:
  - `CodeRabbit` パス
  - `GitGuardian Security Checks` パス

スコープ:

- `scripts/codex-git-hooks/pre-commit`
- `scripts/codex-git-hooks/pre-push`
- `scripts/codex/check-codex-global-state.sh`
- `scripts/codex/install-global-git-hooks.sh`
- `scripts/sync-ecc-to-codex.sh`

アセスメント:

- この PR はコンフリクトはなくなったが、依然としてドラフトのみで、意味のあるファーストパーティレビューがまだ行われていない。
- ユーザーグローバルの Codex セットアップ動作と git-hook インストールを変更するため、運用上の影響範囲はドキュメントのみの PR よりも大きい。
- 確認できるチェックは外部ボットのみ。現在のチェックセットに完全な GitHub Actions ランは表示されていない。
- ブランチがコントリビューターフォークの `main` から来ているため、ステータスを変更する前に実際に何が提案されているかの追加サニティパスも必要。

現在の推奨:

- `マージ準備完了前に変更が必要`。必要な変更は、既に証明されたコード欠陥ではなく、プロセスとレビュー指向:
  - 手動レビューを完了
  - グローバルステートスクリプトのバリデーションを実行または確認
  - そのレビューが完了した後にのみドラフトを解除

### `#420` -- Laravel スキル

ライブ状態:

- オープン
- ドラフト
- `MERGEABLE`
- マージ状態 `UNSTABLE`
- 確認できるチェック:
  - `CodeRabbit` パス
  - `GitGuardian Security Checks` パス

スコープ:

- `README.md`
- `examples/laravel-api-CLAUDE.md`
- `rules/php/patterns.md`
- `rules/php/security.md`
- `rules/php/testing.md`
- `skills/configure-ecc/SKILL.md`
- `skills/laravel-patterns/SKILL.md`
- `skills/laravel-security/SKILL.md`
- `skills/laravel-tdd/SKILL.md`
- `skills/laravel-verification/SKILL.md`

アセスメント:

- コンテンツ中心で、運用上のリスクは `#336` よりも低い。
- 依然としてドラフトで、実質的なヒューマンレビューがまだ行われていない。
- 確認できるチェックは外部ボットのみ。
- ライブ PR 状態にマージブロッカーを示すものはないが、依然としてドラフトでレビュー不足のため、マージ準備は未完了。

現在の推奨:

- `最優先の非ドラフト作業の後にレビュー。`
- 著者がドラフト解除の準備ができたら、良いレビュー候補になる可能性が高い。

## マージ可能性バケット

### 最終オーナーパス後に即座にマージ可能

- `#292`

### マージ前に変更が必要

- `#298`
- `#336`

### ドラフト / マージ判断前にレビューが必要

- `#420`

### スタール `30日以上`

- なし

## 推奨順序

1. `#292`
   現在のキューで最もクリーンなライブマージ候補。
2. `#420`
   ランタイムリスクが低いが、ドラフト解除と実際のレビューパスを待つこと。
3. `#336`
   グローバル Codex 同期と hook 動作を変更するため、慎重にレビュー。
4. `#298`
   より多くのレビュー時間を費やす前に、rebase して実質的なコンテンツ/サンプルの修正を行うこと。

## 結論

- `#399`: 安全なバグ修正マージ。1つのフォローアップクリーンアップがまだ必要
- `#292`: 現在のオープンキューで最優先のマージ候補
- `#298`: マージ不可。コンフリクトと実質的なコンテンツ欠陥
- `#336`: コンフリクトはなくなったが、ドラフトのまま軽い検証では準備不十分
- `#420`: ドラフト、低リスクコンテンツレーン、非ドラフトキューの後にレビュー

## ライブリフレッシュ

`2026-03-13T22:11:40Z` にリフレッシュ。

### メインブランチ

- `origin/main` は現在グリーンで、Windows テストマトリックスを含む。
- メインライン CI 修復は現在のボトルネックではない。

### 更新されたキュー読み取り

#### `#292` -- ガバナンス / 設定基盤

- オープン
- 非ドラフト
- `MERGEABLE`
- 確認できるチェック:
  - `CodeRabbit` パス
  - `GitGuardian Security Checks` パス
- 最もシグナルの高い残りの作業は CI 修復ではなく、マージ前の `.env.example` と PR テンプレートの整合性に関する小さな正確性パス

現在の推奨:

- `次にアクション可能な PR。`
- 残りのドキュメント/設定の正確性問題にパッチを当てるか、現在のトレードオフを受け入れて最終オーナーパスを行いマージ。

#### `#420` -- Laravel スキル

- オープン
- ドラフト
- `MERGEABLE`
- 確認できるチェック:
  - `CodeRabbit` は PR がドラフトのためスキップ
  - `GitGuardian Security Checks` パス
- 実質的なヒューマンレビューはまだ確認できない

現在の推奨:

- `非ドラフトキューの後にレビュー。`
- 実装リスクは低いが、ドラフトのままレビュー不足ではマージ準備未完了。

#### `#336` -- Codex CLI カスタマイゼーション

- オープン
- ドラフト
- `MERGEABLE`
- 確認できるチェック:
  - `CodeRabbit` パス
  - `GitGuardian Security Checks` パス
- グローバル Codex 同期と git-hook インストール動作に触れるため、意図的な手動レビューがまだ必要

現在の推奨:

- `手動レビューレーン。即座のマージレーンではない。`

#### `#298` -- 大規模コンテンツ拡張

- オープン
- 非ドラフト
- `CONFLICTING`
- キューの中で依然として最も困難な PR

現在の推奨:

- `現在のオープン PR の中で最後の優先度。`
- まず rebase し、次に実質的なコンテンツ/サンプルの修正を対処。

### 現在の順序

1. `#292`
2. `#420`
3. `#336`
4. `#298`
