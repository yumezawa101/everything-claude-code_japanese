---
name: configure-ecc
description: claudecode-tool-ja のインタラクティブインストーラー — スキルとルールの選択・インストールをユーザーレベルまたはプロジェクトレベルのディレクトリにガイドし、パスを検証し、オプションでインストール済みファイルを最適化します。
---

# claudecode-tool-ja (ECC) の設定

claudecode-tool-ja プロジェクトのインタラクティブなステップバイステップのインストールウィザードです。`AskUserQuestion` を使用して、スキルとルールの選択的インストールをガイドし、正確性を検証し、最適化を提供します。

## 起動条件

- ユーザーが「configure ecc」「install ecc」「setup everything claude code」などと発言した場合
- ユーザーがこのプロジェクトからスキルやルールを選択的にインストールしたい場合
- ユーザーが既存の ECC インストールを検証または修正したい場合
- ユーザーがインストール済みのスキルやルールをプロジェクトに合わせて最適化したい場合

## 前提条件

このスキルは起動前に Claude Code からアクセス可能である必要があります。ブートストラップ方法は2つあります：
1. **プラグイン経由**: `/plugin install claudecode-tool-ja@claudecode-tool-ja` — プラグインがこのスキルを自動的に読み込みます
2. **手動**: このスキルのみを `~/.claude/skills/configure-ecc/SKILL.md` にコピーし、「configure ecc」と発言して起動

---

## ステップ 0: ECC リポジトリをクローン

インストールを開始する前に、最新の ECC ソースを `/tmp` にクローンします：

```bash
rm -rf /tmp/everything-claude-code
git clone https://github.com/yumezawa101/everything-claude-code_japanese.git /tmp/everything-claude-code
```

以降のすべてのコピー操作のソースとして `ECC_ROOT=/tmp/everything-claude-code` を設定します。

クローンが失敗した場合（ネットワークの問題など）、`AskUserQuestion` を使用して既存の ECC クローンのローカルパスをユーザーに尋ねてください。

---

## ステップ 1: インストールレベルを選択

`AskUserQuestion` を使用してインストール先をユーザーに尋ねます：

```
Question: "ECC コンポーネントをどこにインストールしますか？"
Options:
  - "ユーザーレベル (~/.claude/)" — "すべての Claude Code プロジェクトに適用されます"
  - "プロジェクトレベル (.claude/)" — "現在のプロジェクトにのみ適用されます"
  - "両方" — "共通/共有アイテムをユーザーレベル、プロジェクト固有アイテムをプロジェクトレベルに配置"
```

選択結果を `INSTALL_LEVEL` として保存します。ターゲットディレクトリを設定：
- ユーザーレベル: `TARGET=~/.claude`
- プロジェクトレベル: `TARGET=.claude`（現在のプロジェクトルートからの相対パス）
- 両方: `TARGET_USER=~/.claude`, `TARGET_PROJECT=.claude`

ターゲットディレクトリが存在しない場合は作成します：
```bash
mkdir -p $TARGET/skills $TARGET/rules
```

---

## ステップ 2: スキルの選択とインストール

### 2a: スキルカテゴリの選択

27個のスキルが4つのカテゴリに整理されています。`AskUserQuestion` を `multiSelect: true` で使用します：

```
Question: "どのスキルカテゴリをインストールしますか？"
Options:
  - "フレームワーク & 言語" — "Django、Spring Boot、Go、Python、Java、フロントエンド、バックエンドパターン"
  - "データベース" — "PostgreSQL、ClickHouse、JPA/Hibernate パターン"
  - "ワークフロー & 品質" — "TDD、検証、学習、セキュリティレビュー、コンパクション"
  - "全スキル" — "利用可能なすべてのスキルをインストール"
```

### 2b: 個別スキルの確認

選択されたカテゴリごとに、以下の全スキルリストを表示し、ユーザーに特定のスキルの確認または選択解除を求めます。リストが4項目を超える場合は、テキストとしてリストを表示し、`AskUserQuestion` で「リスト全体をインストール」オプションと「Other」（ユーザーが特定の名前を入力するため）を使用します。

**カテゴリ: フレームワーク & 言語（16スキル）**

| スキル | 説明 |
|-------|------|
| `backend-patterns` | バックエンドアーキテクチャ、API 設計、Node.js/Express/Next.js のサーバーサイドベストプラクティス |
| `coding-standards` | TypeScript、JavaScript、React、Node.js のユニバーサルコーディング標準 |
| `django-patterns` | Django アーキテクチャ、DRF による REST API、ORM、キャッシュ、シグナル、ミドルウェア |
| `django-security` | Django セキュリティ: 認証、CSRF、SQL インジェクション、XSS 防止 |
| `django-tdd` | pytest-django、factory_boy、モッキング、カバレッジによる Django テスト |
| `django-verification` | Django 検証ループ: マイグレーション、リンティング、テスト、セキュリティスキャン |
| `frontend-patterns` | React、Next.js、状態管理、パフォーマンス、UI パターン |
| `golang-patterns` | Go のイディオムとベストプラクティス、堅牢な Go アプリケーションのための規約 |
| `golang-testing` | Go テスト: テーブル駆動テスト、サブテスト、ベンチマーク、ファジング |
| `java-coding-standards` | Spring Boot 向け Java コーディング標準: 命名規則、イミュータビリティ、Optional、ストリーム |
| `python-patterns` | Python のイディオム、PEP 8、型ヒント、ベストプラクティス |
| `python-testing` | pytest による Python テスト、TDD、フィクスチャ、モッキング、パラメトリゼーション |
| `springboot-patterns` | Spring Boot アーキテクチャ、REST API、レイヤードサービス、キャッシュ、非同期 |
| `springboot-security` | Spring Security: 認証/認可、バリデーション、CSRF、シークレット、レート制限 |
| `springboot-tdd` | JUnit 5、Mockito、MockMvc、Testcontainers による Spring Boot TDD |
| `springboot-verification` | Spring Boot 検証: ビルド、静的解析、テスト、セキュリティスキャン |

**カテゴリ: データベース（3スキル）**

| スキル | 説明 |
|-------|------|
| `clickhouse-io` | ClickHouse パターン、クエリ最適化、分析、データエンジニアリング |
| `jpa-patterns` | JPA/Hibernate エンティティ設計、リレーションシップ、クエリ最適化、トランザクション |
| `postgres-patterns` | PostgreSQL クエリ最適化、スキーマ設計、インデックス、セキュリティ |

**カテゴリ: ワークフロー & 品質（8スキル）**

| スキル | 説明 |
|-------|------|
| `continuous-learning` | セッションから再利用可能なパターンを自動抽出し、学習済みスキルとして保存 |
| `continuous-learning-v2` | 信頼度スコアリング付きの instinct ベース学習、スキル/コマンド/エージェントに進化 |
| `eval-harness` | eval 駆動開発（EDD）のための正式な評価フレームワーク |
| `iterative-retrieval` | サブエージェントの context 問題に対する段階的な context 精緻化 |
| `security-review` | セキュリティチェックリスト: 認証、入力、シークレット、API、決済機能 |
| `strategic-compact` | 論理的な間隔での手動 context コンパクションを提案 |
| `tdd-workflow` | 80%以上のカバレッジで TDD を強制: ユニット、結合、E2E |
| `verification-loop` | 検証と品質ループパターン |

**スタンドアロン**

| スキル | 説明 |
|-------|------|
| `project-guidelines-example` | プロジェクト固有のスキルを作成するためのテンプレート |

### 2c: インストールの実行

選択された各スキルについて、スキルディレクトリ全体をコピーします：
```bash
cp -r $ECC_ROOT/skills/<skill-name> $TARGET/skills/
```

注意: `continuous-learning` と `continuous-learning-v2` には追加ファイル（config.json、hooks、スクリプト）があります — SKILL.md だけでなくディレクトリ全体がコピーされていることを確認してください。

---

## ステップ 3: ルールの選択とインストール

`AskUserQuestion` を `multiSelect: true` で使用します：

```
Question: "どのルールセットをインストールしますか？"
Options:
  - "共通ルール（推奨）" — "言語非依存の原則: コーディングスタイル、git ワークフロー、テスト、セキュリティなど（8ファイル）"
  - "TypeScript/JavaScript" — "TS/JS パターン、hooks、Playwright テスト（5ファイル）"
  - "Python" — "Python パターン、pytest、black/ruff フォーマット（5ファイル）"
  - "Go" — "Go パターン、テーブル駆動テスト、gofmt/staticcheck（5ファイル）"
```

インストールを実行：
```bash
# 共通ルール（rules/ にフラットコピー）
cp -r $ECC_ROOT/rules/common/* $TARGET/rules/

# 言語固有ルール（rules/ にフラットコピー）
cp -r $ECC_ROOT/rules/typescript/* $TARGET/rules/   # 選択した場合
cp -r $ECC_ROOT/rules/python/* $TARGET/rules/        # 選択した場合
cp -r $ECC_ROOT/rules/golang/* $TARGET/rules/        # 選択した場合
```

**重要**: ユーザーが言語固有ルールを選択し、共通ルールを選択しなかった場合は警告してください：
> 「言語固有ルールは共通ルールを拡張しています。共通ルールなしでインストールすると、カバレッジが不完全になる可能性があります。共通ルールもインストールしますか？」

---

## ステップ 4: インストール後の検証

インストール後、以下の自動チェックを実行します：

### 4a: ファイルの存在確認

インストールされたすべてのファイルをリストし、ターゲットの場所に存在することを確認します：
```bash
ls -la $TARGET/skills/
ls -la $TARGET/rules/
```

### 4b: パス参照のチェック

インストールされたすべての `.md` ファイルのパス参照をスキャンします：
```bash
grep -rn "~/.claude/" $TARGET/skills/ $TARGET/rules/
grep -rn "../common/" $TARGET/rules/
grep -rn "skills/" $TARGET/skills/
```

**プロジェクトレベルインストールの場合**、`~/.claude/` パスへの参照にフラグを立てます：
- スキルが `~/.claude/settings.json` を参照している場合 — これは通常問題ありません（設定は常にユーザーレベル）
- スキルが `~/.claude/skills/` や `~/.claude/rules/` を参照している場合 — プロジェクトレベルのみにインストールした場合は壊れている可能性があります
- スキルが別のスキルを名前で参照している場合 — 参照先のスキルもインストールされていることを確認してください

### 4c: スキル間のクロスリファレンスチェック

一部のスキルは他のスキルを参照しています。以下の依存関係を確認してください：
- `django-tdd` は `django-patterns` を参照する可能性あり
- `springboot-tdd` は `springboot-patterns` を参照する可能性あり
- `continuous-learning-v2` は `~/.claude/homunculus/` ディレクトリを参照
- `python-testing` は `python-patterns` を参照する可能性あり
- `golang-testing` は `golang-patterns` を参照する可能性あり
- 言語固有ルールは `common/` の対応ファイルを参照

### 4d: 問題の報告

検出された各問題について報告してください：
1. **ファイル**: 問題のある参照を含むファイル
2. **行**: 行番号
3. **問題**: 何が問題か（例: 「~/.claude/skills/python-patterns を参照していますが、python-patterns はインストールされていません」）
4. **修正案**: 対処方法（例: 「python-patterns スキルをインストールする」または「パスを .claude/skills/ に更新する」）

---

## ステップ 5: インストール済みファイルの最適化（任意）

`AskUserQuestion` を使用します：

```
Question: "インストールされたファイルをプロジェクトに合わせて最適化しますか？"
Options:
  - "スキルを最適化" — "不要なセクションを削除、パスを調整、技術スタックに合わせてカスタマイズ"
  - "ルールを最適化" — "カバレッジ目標の調整、プロジェクト固有のパターンを追加、ツール設定のカスタマイズ"
  - "両方を最適化" — "インストールされたすべてのファイルを完全に最適化"
  - "スキップ" — "すべてそのまま維持"
```

### スキルを最適化する場合：
1. インストールされた各 SKILL.md を読み取る
2. ユーザーのプロジェクトの技術スタックを尋ねる（まだ不明な場合）
3. 各スキルについて、不要なセクションの削除を提案する
4. インストール先の SKILL.md ファイルをインプレースで編集する（ソースリポジトリではない）
5. ステップ 4 で見つかったパスの問題を修正する

### ルールを最適化する場合：
1. インストールされた各ルール .md ファイルを読み取る
2. ユーザーの好みを尋ねる：
   - テストカバレッジ目標（デフォルト 80%）
   - 好みのフォーマットツール
   - Git ワークフローの規約
   - セキュリティ要件
3. インストール先のルールファイルをインプレースで編集する

**重要**: インストール先（`$TARGET/`）のファイルのみを変更し、ソース ECC リポジトリ（`$ECC_ROOT/`）のファイルは**絶対に変更しないでください**。

---

## ステップ 6: インストールサマリー

`/tmp` からクローンしたリポジトリをクリーンアップします：

```bash
rm -rf /tmp/everything-claude-code
```

サマリーレポートを表示します：

```
## ECC インストール完了

### インストール先
- レベル: [ユーザーレベル / プロジェクトレベル / 両方]
- パス: [ターゲットパス]

### インストールされたスキル ([数])
- skill-1, skill-2, skill-3, ...

### インストールされたルール ([数])
- common (8 ファイル)
- typescript (5 ファイル)
- ...

### 検証結果
- [数] 件の問題を検出、[数] 件を修正
- [残りの問題のリスト]

### 適用された最適化
- [変更内容のリスト、または「なし」]
```

---

## トラブルシューティング

### 「スキルが Claude Code に認識されない」
- スキルディレクトリに `SKILL.md` ファイルが含まれていることを確認（個別の .md ファイルだけでなく）
- ユーザーレベルの場合: `~/.claude/skills/<skill-name>/SKILL.md` が存在することを確認
- プロジェクトレベルの場合: `.claude/skills/<skill-name>/SKILL.md` が存在することを確認

### 「ルールが機能しない」
- ルールはフラットファイルで、サブディレクトリではありません: `$TARGET/rules/coding-style.md`（正しい）vs `$TARGET/rules/common/coding-style.md`（フラットインストールでは不正）
- ルールのインストール後、Claude Code を再起動してください

### 「プロジェクトレベルインストール後のパス参照エラー」
- 一部のスキルは `~/.claude/` パスを前提としています。ステップ 4 の検証を実行して検出・修正してください。
- `continuous-learning-v2` の場合、`~/.claude/homunculus/` ディレクトリは常にユーザーレベルです — これは想定通りでありエラーではありません。
