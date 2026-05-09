---
description: NanoClaw v2 を起動します。ECC の永続的・ゼロ依存の REPL で、モデルルーティング、スキルのホットロード、ブランチ、圧縮、エクスポート、メトリクスに対応します。
---

# Claw コマンド

永続的な Markdown 履歴と運用制御を備えたインタラクティブな AI エージェントセッションを開始します。

## 使用方法

```bash
node scripts/claw.js
```

または npm 経由:

```bash
npm run claw
```

## 環境変数

| 変数 | デフォルト | 説明 |
|----------|---------|-------------|
| `CLAW_SESSION` | `default` | セッション名（英数字 + ハイフン） |
| `CLAW_SKILLS` | *(空)* | 起動時に読み込むスキル（カンマ区切り） |
| `CLAW_MODEL` | `sonnet` | セッションのデフォルトモデル |

## REPL コマンド

```text
/help                          ヘルプを表示
/clear                         現在のセッション履歴をクリア
/history                       会話履歴全体を表示
/sessions                      保存されたセッションを一覧表示
/model [name]                  モデルを表示/設定
/load <skill-name>             スキルをコンテキストにホットロード
/branch <session-name>         現在のセッションをブランチ
/search <query>                セッション横断でクエリを検索
/compact                       古いターンを圧縮し、最近のコンテキストを保持
/export <md|json|txt> [path]   セッションをエクスポート
/metrics                       セッションメトリクスを表示
exit                           終了
```

## 注意事項

- NanoClaw はゼロ依存を維持します。
- セッションは `~/.claude/claw/<session>.md` に保存されます。
- 圧縮は最近のターンを保持し、圧縮ヘッダーを書き込みます。
- エクスポートは Markdown、JSON ターン、プレーンテキストに対応します。
