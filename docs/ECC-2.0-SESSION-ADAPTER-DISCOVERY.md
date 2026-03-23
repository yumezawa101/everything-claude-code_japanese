# ECC 2.0 セッションアダプター探索

## 目的

本ドキュメントは、3月11日の ECC 2.0 コントロールプレーン方針を、このリポジトリに既に存在するオーケストレーションコードに基づいた具体的なアダプターとスナップショット設計に変換します。

## 現在の実装済み基盤

リポジトリには既に実際のファーストパスオーケストレーション基盤が存在します:

- `scripts/lib/tmux-worktree-orchestrator.js`
  tmux ペインと分離された git worktree をプロビジョニング
- `scripts/orchestrate-worktrees.js`
  現在のセッションランチャー
- `scripts/lib/orchestration-session.js`
  機械可読のセッションスナップショットを収集
- `scripts/orchestration-status.js`
  セッション名またはプランファイルからスナップショットをエクスポート
- `commands/sessions.md`
  Claude のローカルストアからの隣接するセッション履歴概念を既に公開
- `scripts/lib/session-adapters/canonical-session.js`
  正規の `ecc.session.v1` 正規化レイヤーを定義
- `scripts/lib/session-adapters/dmux-tmux.js`
  現在のオーケストレーションスナップショットコレクターを `dmux-tmux` アダプターとしてラップ
- `scripts/lib/session-adapters/claude-history.js`
  Claude のローカルセッション履歴を2番目のアダプターとして正規化
- `scripts/lib/session-adapters/registry.js`
  明示的なターゲットとターゲットタイプからアダプターを選択
- `scripts/session-inspect.js`
  アダプターレジストリを通じて正規の読み取り専用セッションスナップショットを出力

実際の運用では、ECC は既に以下を回答できます:

- tmux オーケストレーションセッションにどのワーカーが存在するか
- 各ワーカーがどのペインに接続されているか
- 各ワーカーにどのタスク、ステータス、ハンドオフファイルが存在するか
- セッションがアクティブで、何個のペイン/ワーカーが存在するか
- 最新の Claude ローカルセッションが、オーケストレーションセッションと同じ正規スナップショット形状でどのようなものだったか

これは基盤を証明するのに十分です。しかし、汎用的な ECC 2.0 コントロールプレーンとして認定するにはまだ不十分です。

## 現在のスナップショットが実際にモデル化するもの

`scripts/lib/orchestration-session.js` から出力される現在のスナップショットモデルには、以下の実効フィールドがあります:

```json
{
  "sessionName": "workflow-visual-proof",
  "coordinationDir": ".../.claude/orchestration/workflow-visual-proof",
  "repoRoot": "...",
  "targetType": "plan",
  "sessionActive": true,
  "paneCount": 2,
  "workerCount": 2,
  "workerStates": {
    "running": 1,
    "completed": 1
  },
  "panes": [
    {
      "paneId": "%95",
      "windowIndex": 1,
      "paneIndex": 0,
      "title": "seed-check",
      "currentCommand": "codex",
      "currentPath": "/tmp/worktree",
      "active": false,
      "dead": false,
      "pid": 1234
    }
  ],
  "workers": [
    {
      "workerSlug": "seed-check",
      "workerDir": ".../seed-check",
      "status": {
        "state": "running",
        "updated": "...",
        "branch": "...",
        "worktree": "...",
        "taskFile": "...",
        "handoffFile": "..."
      },
      "task": {
        "objective": "...",
        "seedPaths": ["scripts/orchestrate-worktrees.js"]
      },
      "handoff": {
        "summary": [],
        "validation": [],
        "remainingRisks": []
      },
      "files": {
        "status": ".../status.md",
        "task": ".../task.md",
        "handoff": ".../handoff.md"
      },
      "pane": {
        "paneId": "%95",
        "title": "seed-check"
      }
    }
  ]
}
```

これは既に有用なオペレーターペイロードです。主な制限は、暗黙的に1つの実行スタイルに結び付けられていることです:

- tmux ペインのアイデンティティ
- ワーカースラッグがペインタイトルと等しい
- Markdown 調整ファイル
- プランファイルまたはセッション名のルックアップルール

## ECC 1.x と ECC 2.0 のギャップ

ECC 1.x には現在2つの異なる「セッション」サーフェスがあります:

1. Claude ローカルセッション履歴
2. オーケストレーションランタイム/セッションスナップショット

これらのサーフェスは隣接していますが統一されていません。

欠落している ECC 2.0 レイヤーは、以下を正規化できるハーネス中立のセッションアダプター境界です:

- tmux オーケストレーションワーカー
- プレーン Claude セッション
- Codex worktree セッション
- OpenCode セッション
- 将来の GitHub/App またはリモートコントロールセッション

このアダプターレイヤーがなければ、将来のオペレーター UI は tmux 固有の詳細と調整 Markdown を直接読み取ることを強いられます。

## アダプター境界

ECC 2.0 は正規のセッションアダプターコントラクトを導入すべきです。

推奨される最小インターフェース:

```ts
type SessionAdapter = {
  id: string;
  canOpen(target: SessionTarget): boolean;
  open(target: SessionTarget): Promise<AdapterHandle>;
};

type AdapterHandle = {
  getSnapshot(): Promise<CanonicalSessionSnapshot>;
  streamEvents?(onEvent: (event: SessionEvent) => void): Promise<() => void>;
  runAction?(action: SessionAction): Promise<ActionResult>;
};
```

### 正規スナップショット形状

推奨されるファーストパスの正規ペイロード:

```json
{
  "schemaVersion": "ecc.session.v1",
  "adapterId": "dmux-tmux",
  "session": {
    "id": "workflow-visual-proof",
    "kind": "orchestrated",
    "state": "active",
    "repoRoot": "...",
    "sourceTarget": {
      "type": "plan",
      "value": ".claude/plan/workflow-visual-proof.json"
    }
  },
  "workers": [
    {
      "id": "seed-check",
      "label": "seed-check",
      "state": "running",
      "branch": "...",
      "worktree": "...",
      "runtime": {
        "kind": "tmux-pane",
        "command": "codex",
        "pid": 1234,
        "active": false,
        "dead": false
      },
      "intent": {
        "objective": "...",
        "seedPaths": ["scripts/orchestrate-worktrees.js"]
      },
      "outputs": {
        "summary": [],
        "validation": [],
        "remainingRisks": []
      },
      "artifacts": {
        "statusFile": "...",
        "taskFile": "...",
        "handoffFile": "..."
      }
    }
  ],
  "aggregates": {
    "workerCount": 2,
    "states": {
      "running": 1,
      "completed": 1
    }
  }
}
```

これにより、tmux 固有の詳細をコントロールプレーンコントラクトから除去しつつ、既に存在する有用なシグナルを保持します。

## 最初にサポートすべきアダプター

### 1. `dmux-tmux`

`scripts/lib/orchestration-session.js` に既に存在するロジックをラップします。

基盤が既に実在するため、最も簡単な最初のアダプターです。

### 2. `claude-history`

`commands/sessions.md` と既存のセッションマネージャーユーティリティが既に公開しているデータを正規化します:

- セッション id / エイリアス
- ブランチ
- worktree
- プロジェクトパス
- 最近度 / ファイルサイズ / アイテム数

これにより、ECC 2.0 の非オーケストレーションベースラインが提供されます。

### 3. `codex-worktree`

同じ正規形状を使用しますが、利用可能な場合は tmux の前提ではなく Codex ネイティブの実行メタデータで裏付けます。

### 4. `opencode`

OpenCode セッションメタデータが正規化に十分安定したら、同じアダプター境界を使用します。

## アダプターレイヤーに含めるべきでないもの

アダプターレイヤーが所有すべきでないもの:

- マージシーケンスのビジネスロジック
- オペレーター UI レイアウト
- 価格設定や収益化の決定
- インストールプロファイルの選択
- tmux ライフサイクルオーケストレーション自体

その役割はより狭い:

- セッションターゲットの検出
- 正規化されたスナップショットの読み込み
- オプションでランタイムイベントのストリーミング
- オプションで安全なアクションの公開

## 現在のファイルレイアウト

アダプターレイヤーは現在以下に存在します:

```text
scripts/lib/session-adapters/
  canonical-session.js
  dmux-tmux.js
  claude-history.js
  registry.js
scripts/session-inspect.js
tests/lib/session-adapters.test.js
tests/scripts/session-inspect.test.js
```

現在のオーケストレーションスナップショットパーサーは、唯一のプロダクトコントラクトとして残るのではなく、アダプター実装として消費されるようになりました。

## 直近の次のステップ

1. 3番目のアダプター（おそらく `codex-worktree`）を追加し、抽象化が tmux + Claude-history を超えて進むようにする。
2. UI 作業の開始前に、正規スナップショットに別の `state` と `health` フィールドが必要かどうかを決定。
3. イベントストリーミングが v1 に含まれるべきか、スナップショットレイヤーが実績を証明するまで除外すべきかを決定。
4. オペレーター向けパネルは、オーケストレーション内部を直接読み取るのではなく、アダプターレジストリの上に構築する。

## 未解決の質問

1. ワーカーのアイデンティティはワーカースラッグ、ブランチ、安定した UUID のどれをキーにすべきか?
2. 正規レイヤーに別の `state` と `health` フィールドが必要か?
3. イベントストリーミングは v1 の一部とすべきか、それとも ECC 2.0 はまずスナップショットのみで出荷すべきか?
4. スナップショットがローカルマシンから出る前に、どの程度のパス情報を秘匿すべきか?
5. アダプターレジストリは長期的にこのリポジトリに留まるべきか、インターフェースが安定したら最終的な ECC 2.0 コントロールプレーンアプリに移行すべきか?

## 推奨事項

現在の tmux/worktree 実装をアダプター `0` として扱い、最終的なプロダクトサーフェスとはしないこと。

ECC 2.0 への最短パスは:

1. 現在のオーケストレーション基盤を保持
2. 正規のセッションアダプターコントラクトでラップ
3. 非 tmux アダプターを1つ追加
4. その上でのみオペレーターパネルの構築を開始
