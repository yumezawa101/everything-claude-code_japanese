---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Perl セキュリティ

> このファイルは [common/security.md](../common/security.md) を Perl 固有のコンテンツで拡張します。

## Taint モード

- すべての CGI/Web 向けスクリプトで `-T` フラグを使用
- 外部コマンド実行前に `%ENV`（`$ENV{PATH}`、`$ENV{CDPATH}` など）をサニタイズ

## 入力バリデーション

- アンテイントにはホワイトリスト正規表現を使用 -- `/(.*)/s` は絶対に使わない
- すべてのユーザー入力を明示的なパターンでバリデーション:

```perl
if ($input =~ /\A([a-zA-Z0-9_-]+)\z/) {
    my $clean = $1;
}
```

## ファイル I/O

- **3 引数 open のみ** -- 2 引数 open は使わない
- `Cwd::realpath` でパストラバーサルを防止:

```perl
use Cwd 'realpath';
my $safe_path = realpath($user_path);
die "Path traversal" unless $safe_path =~ m{\A/allowed/directory/};
```

## プロセス実行

- **リスト形式の `system()`** を使用 -- 単一文字列形式は使わない
- 出力のキャプチャには **IPC::Run3** を使用
- 変数補間を含むバッククォートを使用しない

```perl
system('grep', '-r', $pattern, $directory);  # safe
```

## SQL インジェクション防止

常に DBI プレースホルダを使用 -- SQL に値を補間しない:

```perl
my $sth = $dbh->prepare('SELECT * FROM users WHERE email = ?');
$sth->execute($email);
```

## セキュリティスキャン

severity 4 以上で **perlcritic** の security テーマを実行:

```bash
perlcritic --severity 4 --theme security lib/
```

## リファレンス

包括的な Perl セキュリティパターン、taint モード、安全な I/O については、スキル: `perl-security` を参照。
