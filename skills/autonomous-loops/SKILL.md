---
name: autonomous-loops
description: "自律的なClaude Codeループのパターンとアーキテクチャ — シンプルな逐次パイプラインからRFC駆動のマルチエージェントDAGシステムまで。"
origin: ECC
---

# Autonomous Loopsスキル

> 互換性に関する注意（v1.8.0）: `autonomous-loops`は1リリース分保持されます。
> 正規のスキル名は`continuous-agent-loop`になりました。新しいループガイダンスは
> そちらで作成してください。既存のワークフローを壊さないために、このスキルは引き続き利用可能です。

Claude Codeを自律的にループで実行するためのパターン、アーキテクチャ、リファレンス実装。シンプルな`claude -p`パイプラインからRFC駆動のフルマルチエージェントDAGオーケストレーションまでカバーする。

## 使用タイミング

- 人間の介入なしに実行される自律的な開発ワークフローの構築
- 問題に適したループアーキテクチャの選択（シンプル vs 複雑）
- CI/CDスタイルの継続的開発パイプラインの構築
- マージ調整を伴う並列エージェントの実行
- ループイテレーション間のコンテキスト永続化の実装
- 自律ワークフローへの品質ゲートとクリーンアップパスの追加

## ループパターンの範囲

最もシンプルなものから最も洗練されたものまで：

| パターン | 複雑さ | 最適な用途 |
|---------|-----------|----------|
| [逐次パイプライン](#1-逐次パイプラインclaude--p) | 低 | 日次の開発ステップ、スクリプト化されたワークフロー |
| [NanoClaw REPL](#2-nanoclaw-repl) | 低 | インタラクティブな永続セッション |
| [無限エージェンティックループ](#3-無限エージェンティックループ) | 中 | 並列コンテンツ生成、仕様駆動の作業 |
| [Continuous Claude PRループ](#4-continuous-claude-prループ) | 中 | CIゲート付きの複数日にわたる反復プロジェクト |
| [De-Sloppifyパターン](#5-de-sloppifyパターン) | アドオン | 任意のImplementerステップ後の品質クリーンアップ |
| [Ralphinho / RFC駆動DAG](#6-ralphinho--rfc駆動dagオーケストレーション) | 高 | 大規模機能、マージキュー付きのマルチユニット並列作業 |

---

## 1. 逐次パイプライン（`claude -p`）

**最もシンプルなループ。** 日次の開発作業を非インタラクティブな`claude -p`呼び出しのシーケンスに分解する。各呼び出しは明確なプロンプトを持つ焦点を絞ったステップ。

### コアインサイト

> このようなループを理解できない場合、インタラクティブモードでもLLMにコードを修正させることができないことを意味する。

`claude -p`フラグはClaude Codeをプロンプト付きで非インタラクティブに実行し、完了時に終了する。呼び出しをチェーンしてパイプラインを構築する：

```bash
#!/bin/bash
# daily-dev.sh — Sequential pipeline for a feature branch

set -e

# Step 1: Implement the feature
claude -p "Read the spec in docs/auth-spec.md. Implement OAuth2 login in src/auth/. Write tests first (TDD). Do NOT create any new documentation files."

# Step 2: De-sloppify (cleanup pass)
claude -p "Review all files changed by the previous commit. Remove any unnecessary type tests, overly defensive checks, or testing of language features (e.g., testing that TypeScript generics work). Keep real business logic tests. Run the test suite after cleanup."

# Step 3: Verify
claude -p "Run the full build, lint, type check, and test suite. Fix any failures. Do not add new features."

# Step 4: Commit
claude -p "Create a conventional commit for all staged changes. Use 'feat: add OAuth2 login flow' as the message."
```

### 主要な設計原則

1. **各ステップは分離されている** — `claude -p`呼び出しごとにフレッシュなコンテキストウィンドウを使うため、ステップ間のコンテキスト漏れがない。
2. **順序が重要** — ステップは順次実行される。各ステップは前のステップが残したファイルシステム状態の上に構築される。
3. **否定的な指示は危険** — 「型システムをテストするな」と言わない。代わりに別のクリーンアップステップを追加する（[De-Sloppifyパターン](#5-de-sloppifyパターン)を参照）。
4. **終了コードが伝播する** — `set -e`により失敗時にパイプラインが停止する。

### バリエーション

**モデルルーティング付き：**
```bash
# Research with Opus (deep reasoning)
claude -p --model opus "Analyze the codebase architecture and write a plan for adding caching..."

# Implement with Sonnet (fast, capable)
claude -p "Implement the caching layer according to the plan in docs/caching-plan.md..."

# Review with Opus (thorough)
claude -p --model opus "Review all changes for security issues, race conditions, and edge cases..."
```

**環境コンテキスト付き：**
```bash
# Pass context via files, not prompt length
echo "Focus areas: auth module, API rate limiting" > .claude-context.md
claude -p "Read .claude-context.md for priorities. Work through them in order."
rm .claude-context.md
```

**`--allowedTools`制限付き：**
```bash
# Read-only analysis pass
claude -p --allowedTools "Read,Grep,Glob" "Audit this codebase for security vulnerabilities..."

# Write-only implementation pass
claude -p --allowedTools "Read,Write,Edit,Bash" "Implement the fixes from security-audit.md..."
```

---

## 2. NanoClaw REPL

**ECCの組み込み永続ループ。** 完全な会話履歴付きで`claude -p`を同期的に呼び出すセッション対応REPL。

```bash
# Start the default session
node scripts/claw.js

# Named session with skill context
CLAW_SESSION=my-project CLAW_SKILLS=tdd-workflow,security-review node scripts/claw.js
```

### 仕組み

1. `~/.claude/claw/{session}.md`から会話履歴を読み込む
2. 各ユーザーメッセージは完全な履歴をコンテキストとして`claude -p`に送信される
3. レスポンスはセッションファイルに追記される（Markdown-as-database）
4. セッションは再起動をまたいで永続する

### NanoClaw vs 逐次パイプラインの使い分け

| ユースケース | NanoClaw | 逐次パイプライン |
|----------|----------|-------------------|
| インタラクティブな探索 | はい | いいえ |
| スクリプト化された自動化 | いいえ | はい |
| セッション永続 | 組み込み | 手動 |
| コンテキスト蓄積 | ターンごとに増加 | 各ステップでフレッシュ |
| CI/CD統合 | 不向き | 最適 |

`/claw`コマンドのドキュメントで詳細を参照。

---

## 3. 無限エージェンティックループ

**2プロンプトシステム**で、仕様駆動の生成のために並列サブエージェントをオーケストレーションする。dislerによって開発（credit: @disler）。

### アーキテクチャ：2プロンプトシステム

```
PROMPT 1 (Orchestrator)              PROMPT 2 (Sub-Agents)
┌─────────────────────┐             ┌──────────────────────┐
│ Parse spec file      │             │ Receive full context  │
│ Scan output dir      │  deploys   │ Read assigned number  │
│ Plan iteration       │────────────│ Follow spec exactly   │
│ Assign creative dirs │  N agents  │ Generate unique output │
│ Manage waves         │             │ Save to output dir    │
└─────────────────────┘             └──────────────────────┘
```

### パターン

1. **仕様分析** — Orchestratorが生成対象を定義する仕様ファイル（Markdown）を読み取る
2. **ディレクトリ偵察** — 既存の出力をスキャンして最大イテレーション番号を見つける
3. **並列デプロイ** — N個のサブエージェントを起動し、それぞれに以下を渡す：
   - 完全な仕様
   - ユニークなクリエイティブ方向
   - 特定のイテレーション番号（衝突なし）
   - 既存イテレーションのスナップショット（一意性確保のため）
4. **ウェーブ管理** — 無限モードでは、コンテキストが枯渇するまで3-5エージェントのウェーブをデプロイ

### Claude Code Commandsによる実装

`.claude/commands/infinite.md`を作成する：

```markdown
Parse the following arguments from $ARGUMENTS:
1. spec_file — path to the specification markdown
2. output_dir — where iterations are saved
3. count — integer 1-N or "infinite"

PHASE 1: Read and deeply understand the specification.
PHASE 2: List output_dir, find highest iteration number. Start at N+1.
PHASE 3: Plan creative directions — each agent gets a DIFFERENT theme/approach.
PHASE 4: Deploy sub-agents in parallel (Task tool). Each receives:
  - Full spec text
  - Current directory snapshot
  - Their assigned iteration number
  - Their unique creative direction
PHASE 5 (infinite mode): Loop in waves of 3-5 until context is low.
```

**呼び出し方：**
```bash
/project:infinite specs/component-spec.md src/ 5
/project:infinite specs/component-spec.md src/ infinite
```

### バッチ戦略

| 数量 | 戦略 |
|-------|----------|
| 1-5 | 全エージェント同時 |
| 6-20 | 5つずつのバッチ |
| infinite | 3-5のウェーブ、段階的に高度化 |

### キーインサイト：割り当てによる一意性

エージェントの自己差別化に頼らない。Orchestratorが各エージェントに特定のクリエイティブ方向とイテレーション番号を**割り当てる**。これにより並列エージェント間の概念重複を防止する。

---

## 4. Continuous Claude PRループ

**プロダクショングレードのシェルスクリプト**で、Claude Codeを継続的ループで実行し、PRの作成、CIの待機、自動マージを行う。AnandChowdharyによって作成（credit: @AnandChowdhary）。

### コアループ

```
┌─────────────────────────────────────────────────────┐
│  CONTINUOUS CLAUDE ITERATION                        │
│                                                     │
│  1. Create branch (continuous-claude/iteration-N)   │
│  2. Run claude -p with enhanced prompt              │
│  3. (Optional) Reviewer pass — separate claude -p   │
│  4. Commit changes (claude generates message)       │
│  5. Push + create PR (gh pr create)                 │
│  6. Wait for CI checks (poll gh pr checks)          │
│  7. CI failure? → Auto-fix pass (claude -p)         │
│  8. Merge PR (squash/merge/rebase)                  │
│  9. Return to main → repeat                         │
│                                                     │
│  Limit by: --max-runs N | --max-cost $X             │
│            --max-duration 2h | completion signal     │
└─────────────────────────────────────────────────────┘
```

### インストール

> **警告:** continuous-claudeはコードを確認した上で、そのリポジトリからインストールしてください。外部スクリプトを直接bashにパイプしないでください。

### 使用方法

```bash
# Basic: 10 iterations
continuous-claude --prompt "Add unit tests for all untested functions" --max-runs 10

# Cost-limited
continuous-claude --prompt "Fix all linter errors" --max-cost 5.00

# Time-boxed
continuous-claude --prompt "Improve test coverage" --max-duration 8h

# With code review pass
continuous-claude \
  --prompt "Add authentication feature" \
  --max-runs 10 \
  --review-prompt "Run npm test && npm run lint, fix any failures"

# Parallel via worktrees
continuous-claude --prompt "Add tests" --max-runs 5 --worktree tests-worker &
continuous-claude --prompt "Refactor code" --max-runs 5 --worktree refactor-worker &
wait
```

### イテレーション間コンテキスト：SHARED_TASK_NOTES.md

重要な革新：`SHARED_TASK_NOTES.md`ファイルがイテレーション間で永続する：

```markdown
## Progress
- [x] Added tests for auth module (iteration 1)
- [x] Fixed edge case in token refresh (iteration 2)
- [ ] Still need: rate limiting tests, error boundary tests

## Next Steps
- Focus on rate limiting module next
- The mock setup in tests/helpers.ts can be reused
```

Claudeはイテレーション開始時にこのファイルを読み、イテレーション終了時に更新する。これにより独立した`claude -p`呼び出し間のコンテキストギャップを橋渡しする。

### CI失敗時の回復

PRチェックが失敗した場合、Continuous Claudeは自動的に：
1. `gh run list`で失敗した実行IDを取得する
2. CI修正コンテキスト付きの新しい`claude -p`を起動する
3. Claudeが`gh run view`でログを確認し、コードを修正、コミット、プッシュする
4. チェックを再度待機する（`--ci-retry-max`回まで）

### 完了シグナル

Claudeはマジックフレーズを出力して「完了」を通知できる：

```bash
continuous-claude \
  --prompt "Fix all bugs in the issue tracker" \
  --completion-signal "CONTINUOUS_CLAUDE_PROJECT_COMPLETE" \
  --completion-threshold 3  # Stops after 3 consecutive signals
```

3回連続のイテレーションで完了を通知するとループが停止し、完了した作業への無駄な実行を防止する。

### 主要設定

| フラグ | 目的 |
|------|---------|
| `--max-runs N` | N回の成功イテレーション後に停止 |
| `--max-cost $X` | $X消費後に停止 |
| `--max-duration 2h` | 経過時間後に停止 |
| `--merge-strategy squash` | squash、merge、またはrebase |
| `--worktree <name>` | git worktreeによる並列実行 |
| `--disable-commits` | ドライランモード（git操作なし） |
| `--review-prompt "..."` | イテレーションごとにレビューパスを追加 |
| `--ci-retry-max N` | CI失敗の自動修正（デフォルト：1） |

---

## 5. De-Sloppifyパターン

**任意のループへのアドオンパターン。** 各Implementerステップの後に専用のクリーンアップ/リファクタリングステップを追加する。

### 問題

LLMにTDDでの実装を依頼すると、「テストを書く」を文字通りに受け取りすぎる：
- TypeScriptの型システムが機能することを検証するテスト（`typeof x === 'string'`のテスト）
- 型システムが既に保証していることに対する過度に防御的なランタイムチェック
- ビジネスロジックではなくフレームワーク動作のテスト
- 実際のコードを不明瞭にする過剰なエラーハンドリング

### なぜ否定的指示ではダメか

Implementerプロンプトに「型システムをテストするな」「不要なチェックを追加するな」を追加すると下流に影響する：
- モデルがすべてのテストについて躊躇するようになる
- 正当なエッジケーステストもスキップする
- 品質が予測不能に低下する

### 解決策：別パス

Implementerを制約する代わりに、徹底的に作業させる。その後、焦点を絞ったクリーンアップエージェントを追加する：

```bash
# Step 1: Implement (let it be thorough)
claude -p "Implement the feature with full TDD. Be thorough with tests."

# Step 2: De-sloppify (separate context, focused cleanup)
claude -p "Review all changes in the working tree. Remove:
- Tests that verify language/framework behavior rather than business logic
- Redundant type checks that the type system already enforces
- Over-defensive error handling for impossible states
- Console.log statements
- Commented-out code

Keep all business logic tests. Run the test suite after cleanup to ensure nothing breaks."
```

### ループコンテキストでの使用

```bash
for feature in "${features[@]}"; do
  # Implement
  claude -p "Implement $feature with TDD."

  # De-sloppify
  claude -p "Cleanup pass: review changes, remove test/code slop, run tests."

  # Verify
  claude -p "Run build + lint + tests. Fix any failures."

  # Commit
  claude -p "Commit with message: feat: add $feature"
done
```

### キーインサイト

> 下流の品質に影響する否定的指示を追加する代わりに、別のde-sloppifyパスを追加する。焦点を絞った2つのエージェントは、制約された1つのエージェントを上回る。

---

## 6. Ralphinho / RFC駆動DAGオーケストレーション

**最も洗練されたパターン。** 仕様を依存関係DAGに分解し、各ユニットを段階的品質パイプラインに通し、エージェント駆動のマージキューでランディングするRFC駆動のマルチエージェントパイプライン。enitratによって作成（credit: @enitrat）。

### アーキテクチャ概要

```
RFC/PRD Document
       │
       ▼
  DECOMPOSITION (AI)
  Break RFC into work units with dependency DAG
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  RALPH LOOP (up to 3 passes)                         │
│                                                      │
│  For each DAG layer (sequential, by dependency):     │
│                                                      │
│  ┌── Quality Pipelines (parallel per unit) ───────┐  │
│  │  Each unit in its own worktree:                │  │
│  │  Research → Plan → Implement → Test → Review   │  │
│  │  (depth varies by complexity tier)             │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌── Merge Queue ─────────────────────────────────┐  │
│  │  Rebase onto main → Run tests → Land or evict │  │
│  │  Evicted units re-enter with conflict context  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### RFC分解

AIがRFCを読み取り、作業ユニットを生成する：

```typescript
interface WorkUnit {
  id: string;              // kebab-case identifier
  name: string;            // Human-readable name
  rfcSections: string[];   // Which RFC sections this addresses
  description: string;     // Detailed description
  deps: string[];          // Dependencies (other unit IDs)
  acceptance: string[];    // Concrete acceptance criteria
  tier: "trivial" | "small" | "medium" | "large";
}
```

**分解ルール：**
- より少なく凝集度の高いユニットを好む（マージリスクの最小化）
- ユニット間のファイル重複を最小化する（コンフリクト回避）
- テストは実装と共に保つ（「Xを実装」+「Xをテスト」を分離しない）
- 実際のコード依存関係がある場合にのみ依存関係を設定する

依存関係DAGが実行順序を決定する：
```
Layer 0: [unit-a, unit-b]     ← no deps, run in parallel
Layer 1: [unit-c]             ← depends on unit-a
Layer 2: [unit-d, unit-e]     ← depend on unit-c
```

### 複雑さティア

ティアごとに異なるパイプラインの深さ：

| ティア | パイプラインステージ |
|------|----------------|
| **trivial** | implement → test |
| **small** | implement → test → code-review |
| **medium** | research → plan → implement → test → PRD-review + code-review → review-fix |
| **large** | research → plan → implement → test → PRD-review + code-review → review-fix → final-review |

シンプルな変更に対する高コスト操作を防ぎ、アーキテクチャ変更には徹底した精査を保証する。

### 別コンテキストウィンドウ（著者バイアスの排除）

各ステージは独自のエージェントプロセスと独自のコンテキストウィンドウで実行される：

| ステージ | モデル | 目的 |
|-------|-------|---------|
| Research | Sonnet | コードベース + RFCを読み取り、コンテキストドキュメントを生成 |
| Plan | Opus | 実装ステップを設計 |
| Implement | Codex | 計画に従ってコードを記述 |
| Test | Sonnet | ビルド + テストスイートを実行 |
| PRD Review | Sonnet | 仕様準拠チェック |
| Code Review | Opus | 品質 + セキュリティチェック |
| Review Fix | Codex | レビューの問題に対処 |
| Final Review | Opus | 品質ゲート（largeティアのみ） |

**重要な設計：** レビュアーはレビュー対象のコードを書いていない。これにより著者バイアス — セルフレビューで問題を見逃す最も一般的な原因 — が排除される。

### Eviction付きマージキュー

品質パイプライン完了後、ユニットはマージキューに入る：

```
Unit branch
    │
    ├─ Rebase onto main
    │   └─ Conflict? → EVICT (capture conflict context)
    │
    ├─ Run build + tests
    │   └─ Fail? → EVICT (capture test output)
    │
    └─ Pass → Fast-forward main, push, delete branch
```

**ファイル重複インテリジェンス：**
- 重複のないユニットは投機的に並列でランディング
- 重複するユニットは1つずつランディングし、毎回リベース

**Eviction回復：**
evict時に完全なコンテキスト（コンフリクトファイル、diff、テスト出力）がキャプチャされ、次のRalphパスでimplementerにフィードバックされる：

```markdown
## MERGE CONFLICT — RESOLVE BEFORE NEXT LANDING

Your previous implementation conflicted with another unit that landed first.
Restructure your changes to avoid the conflicting files/lines below.

{full eviction context with diffs}
```

### ステージ間のデータフロー

```
research.contextFilePath ──────────────────→ plan
plan.implementationSteps ──────────────────→ implement
implement.{filesCreated, whatWasDone} ─────→ test, reviews
test.failingSummary ───────────────────────→ reviews, implement (next pass)
reviews.{feedback, issues} ────────────────→ review-fix → implement (next pass)
final-review.reasoning ────────────────────→ implement (next pass)
evictionContext ───────────────────────────→ implement (after merge conflict)
```

### Worktree分離

各ユニットは分離されたworktreeで実行される（jj/Jujutsuを使用、gitではない）：
```
/tmp/workflow-wt-{unit-id}/
```

同じユニットのパイプラインステージはworktreeを**共有**し、research → plan → implement → test → review間で状態（コンテキストファイル、計画ファイル、コード変更）を保持する。

### 主要な設計原則

1. **決定論的実行** — 事前分解により並列性と順序を確定する
2. **レバレッジポイントでの人間レビュー** — 作業計画が最もレバレッジの高い介入ポイント
3. **関心の分離** — 各ステージが別のコンテキストウィンドウと別のエージェントで実行
4. **コンテキスト付きコンフリクト回復** — 完全なevictionコンテキストにより盲目的なリトライではなくインテリジェントな再実行が可能
5. **ティア駆動の深さ** — trivialな変更はresearch/reviewをスキップ、largeな変更は最大限の精査
6. **再開可能なワークフロー** — 完全な状態がSQLiteに永続化、任意のポイントから再開可能

### Ralphinho vs シンプルパターンの使い分け

| シグナル | Ralphinho | シンプルパターン |
|--------|--------------|-------------------|
| 複数の相互依存する作業ユニット | はい | いいえ |
| 並列実装が必要 | はい | いいえ |
| マージコンフリクトの可能性 | はい | いいえ（逐次で十分） |
| 単一ファイルの変更 | いいえ | はい（逐次パイプライン） |
| 複数日のプロジェクト | はい | おそらく（continuous-claude） |
| 仕様/RFCが既に存在 | はい | おそらく |
| 1つの事柄への素早いイテレーション | いいえ | はい（NanoClawまたはパイプライン） |

---

## 適切なパターンの選択

### 決定マトリクス

```
Is the task a single focused change?
├─ Yes → Sequential Pipeline or NanoClaw
└─ No → Is there a written spec/RFC?
         ├─ Yes → Do you need parallel implementation?
         │        ├─ Yes → Ralphinho (DAG orchestration)
         │        └─ No → Continuous Claude (iterative PR loop)
         └─ No → Do you need many variations of the same thing?
                  ├─ Yes → Infinite Agentic Loop (spec-driven generation)
                  └─ No → Sequential Pipeline with de-sloppify
```

### パターンの組み合わせ

これらのパターンは組み合わせが効果的：

1. **逐次パイプライン + De-Sloppify** — 最も一般的な組み合わせ。すべてのimplementステップにクリーンアップパスを付ける。

2. **Continuous Claude + De-Sloppify** — 各イテレーションに`--review-prompt`でde-sloppifyディレクティブを追加する。

3. **任意のループ + Verification** — コミット前のゲートとしてECCの`/verify`コマンドまたは`verification-loop`スキルを使用する。

4. **Ralphinhoのティアドアプローチをシンプルなループで** — 逐次パイプラインでも、シンプルなタスクはHaikuに、複雑なタスクはOpusにルーティングできる：
   ```bash
   # Simple formatting fix
   claude -p --model haiku "Fix the import ordering in src/utils.ts"

   # Complex architectural change
   claude -p --model opus "Refactor the auth module to use the strategy pattern"
   ```

---

## アンチパターン

### よくある間違い

1. **終了条件のない無限ループ** — 常にmax-runs、max-cost、max-duration、または完了シグナルを設定する。

2. **イテレーション間のコンテキストブリッジがない** — 各`claude -p`呼び出しはフレッシュに開始する。`SHARED_TASK_NOTES.md`またはファイルシステム状態でコンテキストを橋渡しする。

3. **同じ失敗のリトライ** — イテレーションが失敗した場合、単にリトライしない。エラーコンテキストをキャプチャして次の試行にフィードする。

4. **クリーンアップパスの代わりに否定的指示** — 「Xをするな」と言わない。Xを削除する別パスを追加する。

5. **すべてのエージェントが1つのコンテキストウィンドウ** — 複雑なワークフローでは関心を異なるエージェントプロセスに分離する。レビュアーは著者であるべきではない。

6. **並列作業でのファイル重複の無視** — 2つの並列エージェントが同じファイルを編集する可能性がある場合、マージ戦略が必要（逐次ランディング、リベース、コンフリクト解決）。

---

## 参考

| プロジェクト | 作者 | リンク |
|---------|--------|------|
| Ralphinho | enitrat | credit: @enitrat |
| Infinite Agentic Loop | disler | credit: @disler |
| Continuous Claude | AnandChowdhary | credit: @AnandChowdhary |
| NanoClaw | ECC | `/claw` command in this repo |
| Verification Loop | ECC | `skills/verification-loop/` in this repo |
