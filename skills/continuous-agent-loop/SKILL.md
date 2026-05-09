---
name: continuous-agent-loop
description: 品質ゲート、eval、回復制御を備えた継続的自律エージェントループのパターン。
origin: ECC
---

# Continuous Agent Loop

v1.8+の正規ループスキル名。`autonomous-loops`を置き換えつつ、1リリース分の互換性を維持する。

## ループ選択フロー

```text
Start
  |
  +-- Need strict CI/PR control? -- yes --> continuous-pr
  |
  +-- Need RFC decomposition? -- yes --> rfc-dag
  |
  +-- Need exploratory parallel generation? -- yes --> infinite
  |
  +-- default --> sequential
```

## 推奨の組み合わせパターン

本番環境の推奨スタック：
1. RFC分解（`ralphinho-rfc-pipeline`）
2. 品質ゲート（`plankton-code-quality` + `/quality-gate`）
3. evalループ（`eval-harness`）
4. セッション永続化（`nanoclaw-repl`）

## 失敗モード

- 測定可能な進捗のないループチャーン
- 同じ根本原因での繰り返しリトライ
- マージキューのストール
- 無制限のエスカレーションによるコストドリフト

## 回復

- ループをフリーズ
- `/harness-audit`を実行
- スコープを失敗ユニットに縮小
- 明示的な受け入れ基準でリプレイ
