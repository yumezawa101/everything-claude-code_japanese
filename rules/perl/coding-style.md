---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Perl コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Perl 固有のコンテンツで拡張します。

## 標準

- 常に `use v5.36`（`strict`、`warnings`、`say`、サブルーチンシグネチャを有効化）
- サブルーチンシグネチャを使用 -- `@_` を手動でアンパックしない
- 明示的な改行付き `print` よりも `say` を優先

## イミュータビリティ

- すべてのアトリビュートに **Moo** の `is => 'ro'` と **Types::Standard** を使用
- blessed ハッシュリファレンスを直接使用しない -- 常に Moo/Moose アクセサを使用
- **OO のオーバーライドに関する注意**: `builder` または `default` を持つ Moo `has` アトリビュートは計算された読み取り専用値として許容

## フォーマット

以下の設定で **perltidy** を使用:

```
-i=4    # 4 スペースインデント
-l=100  # 100 文字行長
-ce     # cuddled else
-bar    # 開き波括弧は常に右
```

## リント

severity 3 で **perlcritic** を使用、テーマ: `core`、`pbp`、`security`。

```bash
perlcritic --severity 3 --theme 'core || pbp || security' lib/
```

## リファレンス

包括的なモダン Perl イディオムとベストプラクティスについては、スキル: `perl-patterns` を参照。
