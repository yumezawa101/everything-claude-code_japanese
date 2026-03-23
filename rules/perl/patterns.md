---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Perl パターン

> このファイルは [common/patterns.md](../common/patterns.md) を Perl 固有のコンテンツで拡張します。

## Repository パターン

**DBI** または **DBIx::Class** をインターフェースの背後で使用:

```perl
package MyApp::Repo::User;
use Moo;

has dbh => (is => 'ro', required => 1);

sub find_by_id ($self, $id) {
    my $sth = $self->dbh->prepare('SELECT * FROM users WHERE id = ?');
    $sth->execute($id);
    return $sth->fetchrow_hashref;
}
```

## DTO / 値オブジェクト

**Moo** クラスと **Types::Standard** を使用（Python dataclass に相当）:

```perl
package MyApp::DTO::User;
use Moo;
use Types::Standard qw(Str Int);

has name  => (is => 'ro', isa => Str, required => 1);
has email => (is => 'ro', isa => Str, required => 1);
has age   => (is => 'ro', isa => Int);
```

## リソース管理

- 常に **3 引数 open** を `autodie` と共に使用
- ファイル操作には **Path::Tiny** を使用

```perl
use autodie;
use Path::Tiny;

my $content = path('config.json')->slurp_utf8;
```

## モジュールインターフェース

`Exporter 'import'` と `@EXPORT_OK` を使用 -- `@EXPORT` は使わない:

```perl
use Exporter 'import';
our @EXPORT_OK = qw(parse_config validate_input);
```

## 依存関係管理

再現可能なインストールに **cpanfile** + **carton** を使用:

```bash
carton install
carton exec prove -lr t/
```

## リファレンス

包括的なモダン Perl パターンとイディオムについては、スキル: `perl-patterns` を参照。
