# メトリクスとスポンサーシップ プレイブック

本ファイルはスポンサー向けの電話やエコシステムパートナーレビュー用の実践的なスクリプトです。

## トラッキング対象

すべてのアップデートで以下の4カテゴリを使用:

1. **配布** -- npm パッケージと GitHub App のインストール数
2. **採用** -- スター、フォーク、コントリビューター、リリース頻度
3. **プロダクトサーフェス** -- コマンド/スキル/agent とクロスプラットフォームサポート
4. **信頼性** -- テストパス数と本番バグの対応速度

## ライブメトリクスの取得

### npm ダウンロード

```bash
# Weekly downloads
curl -s https://api.npmjs.org/downloads/point/last-week/ecc-universal
curl -s https://api.npmjs.org/downloads/point/last-week/ecc-agentshield

# Last 30 days
curl -s https://api.npmjs.org/downloads/point/last-month/ecc-universal
curl -s https://api.npmjs.org/downloads/point/last-month/ecc-agentshield
```

### GitHub リポジトリの採用状況

```bash
gh api repos/affaan-m/everything-claude-code \
  --jq '{stars:.stargazers_count,forks:.forks_count,contributors_url:.contributors_url,open_issues:.open_issues_count}'
```

### GitHub トラフィック（メンテナーアクセスが必要）

```bash
gh api repos/affaan-m/everything-claude-code/traffic/views
gh api repos/affaan-m/everything-claude-code/traffic/clones
```

### GitHub App インストール

GitHub App のインストール数は現在、Marketplace/App ダッシュボードが最も信頼性が高い情報源です。
以下から最新の値を取得:

- [ECC Tools Marketplace](https://github.com/marketplace/ecc-tools)

## 公開では測定できないもの（現時点）

- Claude プラグインのインストール/ダウンロード数は現在、公開 API 経由では公開されていない。
- パートナーとの会話では、npm メトリクス + GitHub App インストール + リポジトリトラフィックをプロキシバンドルとして使用。

## 推奨スポンサーパッケージ

交渉の出発点として使用:

- **Pilot Partner:** `$200/月`
  - 最初のパートナーシップ検証と簡単な月次スポンサーアップデートに最適。
- **Growth Partner:** `$500/月`
  - ロードマップチェックインと実装フィードバックループを含む。
- **Strategic Partner:** `$1,000+/月`
  - マルチタッチコラボレーション、ローンチサポート、より深い運用上の連携。

## 60秒トーキングトラック

電話で使用:

> ECC は設定リポジトリではなく、agent ハーネスパフォーマンスシステムとして位置付けられています。
> npm 配布、GitHub App インストール、リポジトリの成長を通じて採用を追跡しています。
> Claude プラグインのインストールは公開では構造的に過小カウントされるため、ブレンドメトリクスモデルを使用しています。
> プロジェクトは Claude Code、Cursor、OpenCode、Codex app/CLI をプロダクショングレードの hook 信頼性と大規模なパステストスイートでサポートしています。

ローンチ用のソーシャルコピースニペットについては [`social-launch-copy.md`](./social-launch-copy.md) を参照。
