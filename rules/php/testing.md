---
paths:
  - "**/*.php"
  - "**/phpunit.xml"
  - "**/phpunit.xml.dist"
  - "**/composer.json"
---
# PHP テスト

> このファイルは [common/testing.md](../common/testing.md) を PHP 固有のコンテンツで拡張します。

## フレームワーク

デフォルトのテストフレームワークとして **PHPUnit** を使用。プロジェクトに **Pest** が設定されている場合は、新しいテストに Pest を優先し、フレームワークの混在を避ける。

## カバレッジ

```bash
vendor/bin/phpunit --coverage-text
# または
vendor/bin/pest --coverage
```

CI では **pcov** または **Xdebug** を優先し、カバレッジしきい値は暗黙の知識ではなく CI で管理。

## テストの整理

- 高速なユニットテストとフレームワーク/データベースのインテグレーションテストを分離。
- フィクスチャには大きな手書き配列ではなくファクトリ/ビルダーを使用。
- HTTP/コントローラテストはトランスポートとバリデーションに集中; ビジネスルールは Service レベルのテストに移動。

## Inertia

プロジェクトが Inertia.js を使用している場合、生の JSON アサーションではなく `AssertableInertia` 付きの `assertInertia` でコンポーネント名とプロパティを検証することを優先。

## リファレンス

リポジトリ全体の RED -> GREEN -> REFACTOR ループについては、スキル: `tdd-workflow` を参照。
Laravel 固有のテストパターン（PHPUnit と Pest）については、スキル: `laravel-tdd` を参照。
