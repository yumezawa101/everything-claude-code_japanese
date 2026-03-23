---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Perl テスト

> このファイルは [common/testing.md](../common/testing.md) を Perl 固有のコンテンツで拡張します。

## フレームワーク

新しいプロジェクトには **Test2::V0** を使用（Test::More ではない）:

```perl
use Test2::V0;

is($result, 42, 'answer is correct');

done_testing;
```

## ランナー

```bash
prove -l t/              # lib/ を @INC に追加
prove -lr -j8 t/         # 再帰、8 並列ジョブ
```

`lib/` が `@INC` にあることを確実にするために常に `-l` を使用。

## カバレッジ

**Devel::Cover** を使用 -- 80%以上を目標:

```bash
cover -test
```

## モック

- **Test::MockModule** -- 既存モジュールのメソッドをモック
- **Test::MockObject** -- テストダブルをゼロから作成

## 注意点

- テストファイルは常に `done_testing` で終了
- `prove` で `-l` フラグを忘れない

## リファレンス

Test2::V0、prove、Devel::Cover を使用した詳細な Perl TDD パターンについては、スキル: `perl-testing` を参照。
