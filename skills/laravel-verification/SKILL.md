---
name: laravel-verification
description: Laravelプロジェクトの検証ループ -- 環境チェック、lint、静的解析、カバレッジ付きテスト、セキュリティスキャン、デプロイ準備。
origin: ECC
---

# Laravel検証ループ

PR作成前、大規模な変更後、デプロイ前に実行する。

## 使用タイミング

- Laravelプロジェクトのプルリクエストを作成する前
- 大規模なリファクタリングや依存関係のアップグレード後
- ステージングまたは本番環境へのデプロイ前検証
- lint -> テスト -> セキュリティ -> デプロイ準備の完全なパイプラインを実行する場合

## 仕組み

- 環境チェックからデプロイ準備まで、各レイヤーが前のレイヤーに基づくようにフェーズを順次実行する。
- 環境チェックとComposerチェックが他のすべてのゲートとなる。失敗した場合は即座に停止する。
- lint/静的解析は、完全なテストとカバレッジを実行する前にクリーンであるべき。
- セキュリティとマイグレーションのレビューはテスト後に行い、データやリリースのステップの前に動作を検証する。
- ビルド/デプロイ準備とキュー/スケジューラチェックは最終ゲート。いずれかの失敗でリリースをブロックする。

## フェーズ1: 環境チェック

```bash
php -v
composer --version
php artisan --version
```

- `.env`が存在し、必要なキーが含まれていることを確認
- 本番環境では`APP_DEBUG=false`であることを確認
- `APP_ENV`がターゲットデプロイメント（`production`、`staging`）と一致していることを確認

Laravel Sailをローカルで使用している場合:

```bash
./vendor/bin/sail php -v
./vendor/bin/sail artisan --version
```

## フェーズ1.5: Composerとオートロード

```bash
composer validate
composer dump-autoload -o
```

## フェーズ2: lintと静的解析

```bash
vendor/bin/pint --test
vendor/bin/phpstan analyse
```

プロジェクトがPHPStanの代わりにPsalmを使用している場合:

```bash
vendor/bin/psalm
```

## フェーズ3: テストとカバレッジ

```bash
php artisan test
```

カバレッジ（CI）:

```bash
XDEBUG_MODE=coverage php artisan test --coverage
```

CIの例（フォーマット -> 静的解析 -> テスト）:

```bash
vendor/bin/pint --test
vendor/bin/phpstan analyse
XDEBUG_MODE=coverage php artisan test --coverage
```

## フェーズ4: セキュリティと依存関係チェック

```bash
composer audit
```

## フェーズ5: データベースとマイグレーション

```bash
php artisan migrate --pretend
php artisan migrate:status
```

- 破壊的なマイグレーションは慎重にレビューする
- マイグレーションファイル名が`Y_m_d_His_*`（例: `2025_03_14_154210_create_orders_table.php`）に従い、変更内容を明確に記述していることを確認
- ロールバックが可能であることを確認
- `down()`メソッドを検証し、明示的なバックアップなしに不可逆的なデータ損失がないことを確認

## フェーズ6: ビルドとデプロイ準備

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

- 本番設定でキャッシュウォームアップが成功することを確認
- キューワーカーとスケジューラが設定済みであることを確認
- ターゲット環境で`storage/`と`bootstrap/cache/`が書き込み可能であることを確認

## フェーズ7: キューとスケジューラチェック

```bash
php artisan schedule:list
php artisan queue:failed
```

Horizonを使用している場合:

```bash
php artisan horizon:status
```

`queue:monitor`が利用可能な場合、ジョブを処理せずにバックログを確認するために使用:

```bash
php artisan queue:monitor default --max=100
```

アクティブ検証（ステージングのみ）: 専用キューにno-opジョブをディスパッチし、単一のワーカーで処理する（`sync`以外のキュー接続が設定されていることを確認）。

```bash
php artisan tinker --execute="dispatch((new App\\Jobs\\QueueHealthcheck())->onQueue('healthcheck'))"
php artisan queue:work --once --queue=healthcheck
```

ジョブが期待される副作用（ログエントリ、ヘルスチェックテーブルの行、またはメトリクス）を生成したことを検証する。

これは非本番環境でのみ実行すること。テストジョブの処理が安全な環境に限る。

## 使用例

最小フロー:

```bash
php -v
composer --version
php artisan --version
composer validate
vendor/bin/pint --test
vendor/bin/phpstan analyse
php artisan test
composer audit
php artisan migrate --pretend
php artisan config:cache
php artisan queue:failed
```

CI向けパイプライン:

```bash
composer validate
composer dump-autoload -o
vendor/bin/pint --test
vendor/bin/phpstan analyse
XDEBUG_MODE=coverage php artisan test --coverage
composer audit
php artisan migrate --pretend
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan schedule:list
```
