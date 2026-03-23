# Antigravity セットアップと使用ガイド

Google の [Antigravity](https://antigravity.dev) は、設定に `.agent/` ディレクトリ規約を使用する AI コーディング IDE です。ECC は選択的インストールシステムを通じて Antigravity のファーストクラスサポートを提供しています。

## クイックスタート

```bash
# Antigravity ターゲットで ECC をインストール
./install.sh --target antigravity typescript

# または複数の言語モジュールと一緒に
./install.sh --target antigravity typescript python go
```

これにより、ECC コンポーネントがプロジェクトの `.agent/` ディレクトリにインストールされ、Antigravity がそのまま読み取れる状態になります。

## インストールマッピングの仕組み

ECC はコンポーネント構造を Antigravity が期待するレイアウトに再マッピングします:

| ECC ソース | Antigravity 出力先 | 内容 |
|------------|------------------------|------------------|
| `rules/` | `.agent/rules/` | 言語ルールとコーディング標準（フラット化） |
| `commands/` | `.agent/workflows/` | スラッシュコマンドが Antigravity ワークフローに変換 |
| `agents/` | `.agent/skills/` | Agent 定義が Antigravity スキルに変換 |

> **`.agents/` vs `.agent/` vs `agents/` に関する注意**: インストーラーは3つのソースパスのみを明示的に処理します: `rules` → `.agent/rules/`、`commands` → `.agent/workflows/`、`agents`（ドットプレフィックスなし） → `.agent/skills/`。ECC リポジトリのドットプレフィックス付き `.agents/` ディレクトリは、Codex/Antigravity のスキル定義と `openai.yaml` 設定用の**静的レイアウト**であり、インストーラーによって直接マッピングされません。`.agents/` パスはデフォルトのスキャフォールド操作にフォールスルーします。`.agents/skills/` のコンテンツを Antigravity ランタイムで使用したい場合は、手動で `.agent/skills/` にコピーする必要があります。

### Claude Code との主な違い

- **ルールがフラット化される**: Claude Code はルールをサブディレクトリにネストします（`rules/common/`、`rules/typescript/`）。Antigravity はフラットな `rules/` ディレクトリを期待するため、インストーラーが自動的にこれを処理します。
- **コマンドがワークフローになる**: ECC の `/command` ファイルは `.agent/workflows/` に配置されます。これは Antigravity におけるスラッシュコマンドの同等物です。
- **Agent がスキルになる**: ECC の agent 定義は `.agent/skills/` にマッピングされ、Antigravity がスキル設定を検索する場所です。

## インストール後のディレクトリ構造

```
your-project/
├── .agent/
│   ├── rules/
│   │   ├── coding-standards.md
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── typescript.md          # language-specific rules
│   ├── workflows/
│   │   ├── plan.md
│   │   ├── code-review.md
│   │   ├── tdd.md
│   │   └── ...
│   ├── skills/
│   │   ├── planner.md
│   │   ├── code-reviewer.md
│   │   ├── tdd-guide.md
│   │   └── ...
│   └── ecc-install-state.json     # tracks what ECC installed
```

## `openai.yaml` Agent 設定

`.agents/skills/` 配下の各スキルディレクトリには、パス `.agents/skills/<skill-name>/agents/openai.yaml` に Antigravity 用のスキル設定ファイルが含まれています:

```yaml
interface:
  display_name: "API Design"
  short_description: "REST API design patterns and best practices"
  brand_color: "#F97316"
  default_prompt: "Design REST API: resources, status codes, pagination"
policy:
  allow_implicit_invocation: true
```

| フィールド | 目的 |
|-------|---------|
| `display_name` | Antigravity UI に表示される人間が読める名前 |
| `short_description` | スキルの機能の簡潔な説明 |
| `brand_color` | スキルのビジュアルバッジ用の16進数カラー |
| `default_prompt` | スキルが手動で呼び出された際の推奨プロンプト |
| `allow_implicit_invocation` | `true` の場合、Antigravity がコンテキストに基づいてスキルを自動的にアクティベートできる |

## インストールの管理

### インストール済みの内容を確認

```bash
node scripts/list-installed.js --target antigravity
```

### 壊れたインストールの修復

```bash
# まず問題を診断
node scripts/doctor.js --target antigravity

# 次に、欠損またはドリフトしたファイルを復元
node scripts/repair.js --target antigravity
```

### アンインストール

```bash
node scripts/uninstall.js --target antigravity
```

### インストール状態

インストーラーは `.agent/ecc-install-state.json` を書き込み、ECC が所有するファイルを追跡します。これにより安全なアンインストールと修復が可能になります。ECC は自分が作成していないファイルには決して触れません。

## Antigravity 用カスタムスキルの追加

新しいスキルを作成して Antigravity で使用可能にするには:

1. 通常通り `skills/your-skill-name/SKILL.md` にスキルを作成
2. `agents/your-skill-name.md` に agent 定義を追加 -- このパスがインストーラーによってランタイム時に `.agent/skills/` にマッピングされ、Antigravity ハーネスでスキルが使用可能になります
3. `.agents/skills/your-skill-name/agents/openai.yaml` に Antigravity agent 設定を追加 -- これは Codex が暗黙的呼び出しメタデータに使用する静的リポジトリレイアウトです
4. `SKILL.md` のコンテンツを `.agents/skills/your-skill-name/SKILL.md` にミラーリング -- この静的コピーは Codex が使用し、Antigravity のリファレンスとなります
5. PR に Antigravity サポートを追加した旨を記載

> **重要な区別**: インストーラーは `agents/`（ドットなし） → `.agent/skills/` をデプロイします。これがランタイムでスキルを使用可能にするものです。`.agents/`（ドットプレフィックス付き）ディレクトリは Codex の `openai.yaml` 設定用の別の静的レイアウトであり、インストーラーによって自動デプロイされません。

詳細なコントリビューションガイドは [CONTRIBUTING.md](../CONTRIBUTING.md) を参照してください。

## 他のターゲットとの比較

| 機能 | Claude Code | Cursor | Codex | Antigravity |
|---------|-------------|--------|-------|-------------|
| インストールターゲット | `claude-home` | `cursor-project` | `codex-home` | `antigravity` |
| 設定ルート | `~/.claude/` | `.cursor/` | `~/.codex/` | `.agent/` |
| スコープ | ユーザーレベル | プロジェクトレベル | ユーザーレベル | プロジェクトレベル |
| ルール形式 | ネストディレクトリ | フラット | フラット | フラット |
| コマンド | `commands/` | N/A | N/A | `workflows/` |
| Agents/Skills | `agents/` | N/A | N/A | `skills/` |
| インストール状態 | `ecc-install-state.json` | `ecc-install-state.json` | `ecc-install-state.json` | `ecc-install-state.json` |

## トラブルシューティング

### Antigravity でスキルが読み込まれない

- プロジェクトルート（ホームディレクトリではなく）に `.agent/` ディレクトリが存在することを確認
- `ecc-install-state.json` が作成されているか確認。存在しない場合はインストーラーを再実行
- ファイルに `.md` 拡張子と有効な frontmatter があることを確認

### ルールが適用されない

- ルールは `.agent/rules/` に配置する必要があり、サブディレクトリにネストしてはいけない
- `node scripts/doctor.js --target antigravity` を実行してインストールを検証

### ワークフローが使用できない

- Antigravity は `.agent/workflows/` でワークフローを検索し、`commands/` ではない
- ECC コマンドを手動でコピーした場合は、ディレクトリ名を変更

## 関連リソース

- [Selective Install Architecture](./SELECTIVE-INSTALL-ARCHITECTURE.md) -- インストールシステムの内部動作
- [Selective Install Design](./SELECTIVE-INSTALL-DESIGN.md) -- 設計判断とターゲットアダプターコントラクト
- [CONTRIBUTING.md](../CONTRIBUTING.md) -- スキル、agent、コマンドのコントリビューション方法
