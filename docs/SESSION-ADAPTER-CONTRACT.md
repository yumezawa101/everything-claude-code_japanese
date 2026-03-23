# セッションアダプターコントラクト

本ドキュメントは `ecc.session.v1` の正規 ECC セッションスナップショットコントラクトを定義します。

コントラクトは `scripts/lib/session-adapters/canonical-session.js` で実装されています。本ドキュメントはアダプターとコンシューマーの規範的仕様です。

## 目的

ECC には複数のセッションソースがあります:

- tmux オーケストレーション worktree セッション
- Claude ローカルセッション履歴
- 将来のハーネスとコントロールプレーンバックエンド

アダプターはこれらのソースを1つのコントロールプレーン安全なスナップショット形状に正規化し、検査、永続化、将来の UI レイヤーがハーネス固有のファイルやランタイム詳細に依存しないようにします。

## 正規スナップショット

すべてのアダプターはこのトップレベル形状を持つ JSON シリアライズ可能なオブジェクトを返す必要があります:

```json
{
  "schemaVersion": "ecc.session.v1",
  "adapterId": "dmux-tmux",
  "session": {
    "id": "workflow-visual-proof",
    "kind": "orchestrated",
    "state": "active",
    "repoRoot": "/tmp/repo",
    "sourceTarget": {
      "type": "session",
      "value": "workflow-visual-proof"
    }
  },
  "workers": [
    {
      "id": "seed-check",
      "label": "seed-check",
      "state": "running",
      "branch": "feature/seed-check",
      "worktree": "/tmp/worktree",
      "runtime": {
        "kind": "tmux-pane",
        "command": "codex",
        "pid": 1234,
        "active": false,
        "dead": false
      },
      "intent": {
        "objective": "Inspect seeded files.",
        "seedPaths": ["scripts/orchestrate-worktrees.js"]
      },
      "outputs": {
        "summary": [],
        "validation": [],
        "remainingRisks": []
      },
      "artifacts": {
        "statusFile": "/tmp/status.md",
        "taskFile": "/tmp/task.md",
        "handoffFile": "/tmp/handoff.md"
      }
    }
  ],
  "aggregates": {
    "workerCount": 1,
    "states": {
      "running": 1
    }
  }
}
```

## 必須フィールド

### トップレベル

| フィールド | 型 | 備考 |
| --- | --- | --- |
| `schemaVersion` | string | このコントラクトでは正確に `ecc.session.v1` であること |
| `adapterId` | string | `dmux-tmux` や `claude-history` などの安定したアダプター識別子 |
| `session` | object | 正規セッションメタデータ |
| `workers` | array | 正規ワーカーレコード、空の場合もある |
| `aggregates` | object | 派生ワーカー数 |

### `session`

| フィールド | 型 | 備考 |
| --- | --- | --- |
| `id` | string | アダプタードメイン内の安定した識別子 |
| `kind` | string | `orchestrated` や `history` などの高レベルセッションファミリー |
| `state` | string | 正規セッション状態 |
| `sourceTarget` | object | セッションを開いたターゲットの来歴 |

### `session.sourceTarget`

| フィールド | 型 | 備考 |
| --- | --- | --- |
| `type` | string | `plan`、`session`、`claude-history`、`claude-alias`、`session-file` などのルックアップクラス |
| `value` | string | 生のターゲット値または解決済みパス |

### `workers[]`

| フィールド | 型 | 備考 |
| --- | --- | --- |
| `id` | string | アダプタースコープ内の安定したワーカー識別子 |
| `label` | string | オペレーター向けラベル |
| `state` | string | 正規ワーカー状態 |
| `runtime` | object | 実行/ランタイムメタデータ |
| `intent` | object | このワーカー/セッションが存在する理由 |
| `outputs` | object | 構造化された成果とチェック |
| `artifacts` | object | アダプターが所有するファイル/パス参照 |

### `workers[].runtime`

| フィールド | 型 | 備考 |
| --- | --- | --- |
| `kind` | string | `tmux-pane` や `claude-session` などのランタイムファミリー |
| `active` | boolean | ランタイムが現在アクティブかどうか |
| `dead` | boolean | ランタイムが終了/完了と判明しているかどうか |

### `workers[].intent`

| フィールド | 型 | 備考 |
| --- | --- | --- |
| `objective` | string | 主要な目的またはタイトル |
| `seedPaths` | string[] | ワーカー/セッションに関連するシードまたはコンテキストパス |

### `workers[].outputs`

| フィールド | 型 | 備考 |
| --- | --- | --- |
| `summary` | string[] | 完了した出力またはサマリー項目 |
| `validation` | string[] | バリデーションのエビデンスまたはチェック |
| `remainingRisks` | string[] | 未解決のリスク、フォローアップ、備考 |

### `aggregates`

| フィールド | 型 | 備考 |
| --- | --- | --- |
| `workerCount` | integer | `workers.length` と一致しなければならない |
| `states` | object | `workers[].state` から派生したカウントマップ |

## オプションフィールド

オプションフィールドは省略可能ですが、出力する場合はドキュメント化された型を保持しなければなりません:

| フィールド | 型 | 備考 |
| --- | --- | --- |
| `session.repoRoot` | `string \| null` | 既知の場合のリポジトリ/worktree ルート |
| `workers[].branch` | `string \| null` | 既知の場合のブランチ名 |
| `workers[].worktree` | `string \| null` | 既知の場合の worktree パス |
| `workers[].runtime.command` | `string \| null` | 既知の場合のアクティブコマンド |
| `workers[].runtime.pid` | `number \| null` | 既知の場合のプロセス ID |
| `workers[].artifacts.*` | アダプター定義 | アダプターが所有するファイルパスまたは構造化参照 |

アダプター固有のオプションフィールドは `runtime`、`artifacts`、またはその他のドキュメント化されたネストオブジェクト内に配置されるべきです。アダプターはこのコントラクトを更新せずに新しいトップレベルフィールドを追加してはなりません。

## 状態セマンティクス

コントラクトは意図的に `session.state` と `workers[].state` を複数のハーネスに対して十分柔軟に保っていますが、現在のアダプターは以下の値を使用します:

- `dmux-tmux`
  - セッション状態: `active`、`completed`、`failed`、`idle`、`missing`
  - ワーカー状態: ワーカーステータスファイルから派生、例: `running` や `completed`
- `claude-history`
  - セッション状態: `recorded`
  - ワーカー状態: `recorded`

コンシューマーは未知の状態文字列を有効なアダプター固有の値として扱い、グレースフルにデグレードしなければなりません。

## バージョニング戦略

`schemaVersion` が唯一の互換性ゲートです。コンシューマーはこれに基づいて分岐しなければなりません。

### `ecc.session.v1` で許容されるもの

- 新しいオプションのネストフィールドの追加
- 新しいアダプター ID の追加
- 新しい状態文字列値の追加
- `workers[].artifacts` 内の新しいアーティファクトキーの追加

### 新しいスキーマバージョンが必要なもの

- 必須フィールドの削除
- フィールドのリネーム
- フィールド型の変更
- 既存フィールドの意味を非互換な方法で変更
- 同じバージョン文字列を維持したまま、あるフィールドから別のフィールドへのデータ移動

これらのいずれかが発生した場合、プロデューサーは `ecc.session.v2` などの新しいバージョン文字列を出力しなければなりません。

## アダプター準拠要件

すべての ECC セッションアダプターは:

1. 正確に `schemaVersion: "ecc.session.v1"` を出力すること。
2. すべての必須フィールドと型を満たすスナップショットを返すこと。
3. 不明なオプションスカラー値には `null`、不明なリスト値には空配列を使用すること。
4. アダプター固有の詳細は `runtime`、`artifacts`、またはその他のドキュメント化されたネストオブジェクト内にネストすること。
5. `aggregates.workerCount === workers.length` を保証すること。
6. `aggregates.states` が出力されたワーカー状態と一致することを保証すること。
7. プレーンな JSON シリアライズ可能な値のみを生成すること。
8. 永続化またはダウンストリーム使用前に正規形状をバリデートすること。
9. セッション記録シムを通じて正規化された正規スナップショットを永続化すること。
   このリポジトリでは、そのシムはまず `scripts/lib/state-store` を試み、state store モジュールがまだ利用できない場合にのみ JSON 記録ファイルにフォールバックします。

## コンシューマーの期待

コンシューマーは:

- `ecc.session.v1` のドキュメント化されたフィールドのみに依存すべき
- 不明なオプションフィールドを無視すべき
- `adapterId`、`session.kind`、`runtime.kind` を網羅的な列挙型ではなくルーティングヒントとして扱うべき
- `workers[].artifacts` 内にアダプター固有のアーティファクトキーを期待すべき

コンシューマーは:

- ドキュメント化されていないフィールドからハーネス固有の動作を推論してはならない
- すべてのアダプターが tmux ペイン、git worktree、Markdown 調整ファイルを持つと仮定してはならない
- 状態文字列が見慣れないという理由だけでスナップショットを拒否してはならない

## 現在のアダプターマッピング

### `dmux-tmux`

- ソース: `scripts/lib/orchestration-session.js`
- セッション id: オーケストレーションセッション名
- セッション kind: `orchestrated`
- セッション source target: プランパスまたはセッション名
- ワーカーランタイム kind: `tmux-pane`
- アーティファクト: `statusFile`、`taskFile`、`handoffFile`

### `claude-history`

- ソース: `scripts/lib/session-manager.js`
- セッション id: Claude の短縮 id（存在する場合）、それ以外はセッションファイル名由来の id
- セッション kind: `history`
- セッション source target: 明示的な履歴ターゲット、エイリアス、または `.tmp` セッションファイル
- ワーカーランタイム kind: `claude-session`
- Intent seed paths: `### Context to Load` からパース
- アーティファクト: `sessionFile`、`context`

## バリデーションリファレンス

リポジトリの実装は以下をバリデートします:

- 必須オブジェクト構造
- 必須文字列フィールド
- ブーリアンランタイムフラグ
- 文字列配列の outputs と seed paths
- 集計カウントの一貫性

アダプターはバリデーション失敗をユーザー入力エラーではなく、コントラクトのバグとして扱うべきです。

## 記録フォールバック動作

JSON フォールバックレコーダーは、専用の state store がランディングする前の一時的な互換性シムです。その動作は:

- 最新のスナップショットは常にインプレースで置き換えられる
- 履歴レコードは異なるスナップショット本文のみを記録
- 変更のない繰り返し読み取りは重複する履歴エントリを追加しない

これにより、`session-inspect` やその他のポーリングスタイルの読み取りが、同じ変更のないセッションスナップショットに対して無制限の履歴を増大させることを防ぎます。
