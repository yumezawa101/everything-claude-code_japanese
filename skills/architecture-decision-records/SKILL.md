---
name: architecture-decision-records
description: Claude Codeセッション中に行われたアーキテクチャ上の意思決定を構造化されたADRとして記録する。決定の瞬間を自動検出し、コンテキスト、検討した代替案、根拠を記録する。将来の開発者がコードベースの形状の理由を理解できるようADRログを維持する。
origin: ECC
---

# Architecture Decision Records

コーディングセッション中にアーキテクチャ上の意思決定をリアルタイムで記録する。決定がSlackスレッド、PRコメント、あるいは誰かの記憶にのみ存在する代わりに、このスキルはコードと共に存在する構造化されたADRドキュメントを生成する。

## 発動条件

- ユーザーが明示的に「この決定を記録して」や「ADRにして」と言った場合
- ユーザーが重要な代替案（フレームワーク、ライブラリ、パターン、データベース、API設計）から選択する場合
- ユーザーが「〜にすることにした」や「YではなくXにする理由は...」と言った場合
- ユーザーが「なぜXを選んだのか？」と質問した場合（既存ADRを読む）
- アーキテクチャ上のトレードオフが議論される計画フェーズ中

## ADRフォーマット

Michael Nygardが提唱した軽量ADRフォーマットをAI支援開発向けに適応して使用する：

```markdown
# ADR-NNNN: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | deprecated | superseded by ADR-NNNN
**Deciders**: [who was involved]

## Context

What is the issue that we're seeing that is motivating this decision or change?

[2-5 sentences describing the situation, constraints, and forces at play]

## Decision

What is the change that we're proposing and/or doing?

[1-3 sentences stating the decision clearly]

## Alternatives Considered

### Alternative 1: [Name]
- **Pros**: [benefits]
- **Cons**: [drawbacks]
- **Why not**: [specific reason this was rejected]

### Alternative 2: [Name]
- **Pros**: [benefits]
- **Cons**: [drawbacks]
- **Why not**: [specific reason this was rejected]

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive
- [benefit 1]
- [benefit 2]

### Negative
- [trade-off 1]
- [trade-off 2]

### Risks
- [risk and mitigation]
```

## ワークフロー

### 新規ADRの記録

決定の瞬間が検出された場合：

1. **初期化（初回のみ）** — `docs/adr/`が存在しない場合、ディレクトリの作成、インデックステーブルヘッダーがシードされた`README.md`（下記のADRインデックスフォーマット参照）、手動使用用の空の`template.md`を作成する前にユーザーの確認を求める。明示的な同意なしにファイルを作成しない。
2. **決定を特定する** — 行われているコアなアーキテクチャ上の選択を抽出する
3. **コンテキストを収集する** — どの問題がこれを促したか？どのような制約があるか？
4. **代替案を文書化する** — 他にどのオプションが検討されたか？なぜ却下されたか？
5. **結果を述べる** — トレードオフは何か？何が容易/困難になるか？
6. **番号を割り当てる** — `docs/adr/`内の既存ADRをスキャンしてインクリメントする
7. **確認して書き込む** — ADRの下書きをユーザーに提示してレビューを受ける。明示的な承認後にのみ`docs/adr/NNNN-decision-title.md`に書き込む。ユーザーが拒否した場合、ファイルを書き込まずに下書きを破棄する。
8. **インデックスを更新する** — `docs/adr/README.md`に追記する

### 既存ADRの読み取り

ユーザーが「なぜXを選んだのか？」と質問した場合：

1. `docs/adr/`が存在するか確認する — 存在しない場合は「このプロジェクトにADRは見つかりませんでした。アーキテクチャ上の意思決定の記録を始めますか？」と回答する
2. 存在する場合、`docs/adr/README.md`インデックスで関連エントリを検索する
3. 一致するADRファイルを読み取り、ContextとDecisionセクションを提示する
4. 一致が見つからない場合は「その決定に対するADRは見つかりませんでした。今記録しますか？」と回答する

### ADRディレクトリ構造

```
docs/
└── adr/
    ├── README.md              ← index of all ADRs
    ├── 0001-use-nextjs.md
    ├── 0002-postgres-over-mongo.md
    ├── 0003-rest-over-graphql.md
    └── template.md            ← blank template for manual use
```

### ADRインデックスフォーマット

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](0001-use-nextjs.md) | Use Next.js as frontend framework | accepted | 2026-01-15 |
| [0002](0002-postgres-over-mongo.md) | PostgreSQL over MongoDB for primary datastore | accepted | 2026-01-20 |
| [0003](0003-rest-over-graphql.md) | REST API over GraphQL | accepted | 2026-02-01 |
```

## 決定検出シグナル

会話中にアーキテクチャ上の決定を示すパターンを監視する：

**明示的シグナル**
- 「Xにしよう」
- 「YではなくXを使うべき」
- 「トレードオフは...だから価値がある」
- 「これをADRに記録して」

**暗黙的シグナル**（ADRの記録を提案する — ユーザーの確認なしに自動作成しない）
- 2つのフレームワークやライブラリを比較して結論に達する
- 根拠を述べた上でデータベーススキーマの設計を選択する
- アーキテクチャパターンを選択する（モノリス vs マイクロサービス、REST vs GraphQL）
- 認証/認可戦略を決定する
- 代替案を評価した上でデプロイインフラを選択する

## 良いADRの条件

### すべきこと
- **具体的に** — 「ORMを使う」ではなく「Prisma ORMを使う」
- **理由を記録する** — 根拠は「何を」よりも重要
- **却下された代替案を含める** — 将来の開発者は何が検討されたかを知る必要がある
- **結果を正直に述べる** — すべての決定にはトレードオフがある
- **簡潔に保つ** — ADRは2分以内で読めるべき
- **現在形を使う** — 「Xを使う予定」ではなく「Xを使う」

### すべきでないこと
- 些細な決定を記録する — 変数名やフォーマットの選択にADRは不要
- エッセイを書く — コンテキストセクションが10行を超えたら長すぎる
- 代替案を省略する — 「なんとなく選んだ」は有効な根拠ではない
- マーク付けなしに遡って記録する — 過去の決定を記録する場合は元の日付を記載する
- ADRを古いままにする — 取って代わられた決定は置換先を参照すべき

## ADRのライフサイクル

```
proposed → accepted → [deprecated | superseded by ADR-NNNN]
```

- **proposed**: 決定が議論中で、まだ確定していない
- **accepted**: 決定が有効で、遵守されている
- **deprecated**: 決定がもはや関連しない（例：機能が削除された）
- **superseded**: 新しいADRがこれを置き換える（常に置換先をリンクする）

## 記録に値する決定のカテゴリ

| カテゴリ | 例 |
|----------|---------|
| **技術選定** | フレームワーク、言語、データベース、クラウドプロバイダー |
| **アーキテクチャパターン** | モノリス vs マイクロサービス、イベント駆動、CQRS |
| **API設計** | REST vs GraphQL、バージョニング戦略、認証メカニズム |
| **データモデリング** | スキーマ設計、正規化の決定、キャッシュ戦略 |
| **インフラ** | デプロイモデル、CI/CDパイプライン、モニタリングスタック |
| **セキュリティ** | 認証戦略、暗号化アプローチ、シークレット管理 |
| **テスト** | テストフレームワーク、カバレッジ目標、E2E vs 統合のバランス |
| **プロセス** | ブランチ戦略、レビュープロセス、リリース周期 |

## 他のスキルとの統合

- **Plannerエージェント**: plannerがアーキテクチャ変更を提案した際にADRの作成を提案する
- **Code reviewerエージェント**: 対応するADRなしにアーキテクチャ変更を導入するPRにフラグを立てる
