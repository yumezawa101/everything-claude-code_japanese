#!/bin/bash
# prompt-improver プラグイン インストール/更新スクリプト
# 曖昧なプロンプトを検出して明確化質問を自動生成するhook

set -e

echo "=== prompt-improver プラグイン インストーラー ==="
echo ""

# マーケットプレイスを追加（既に追加済みでもエラーにならない）
echo "[1/2] マーケットプレイスを追加中..."
claude plugin marketplace add severity1/severity1-marketplace 2>/dev/null || true
echo "      ✓ severity1-marketplace を追加しました"

# プラグインをインストール/更新
echo "[2/2] prompt-improver をインストール中..."
claude plugin install prompt-improver@severity1-marketplace
echo "      ✓ prompt-improver をインストールしました"

echo ""
echo "=== インストール完了 ==="
echo ""
echo "prompt-improver が有効になりました。"
echo "曖昧なプロンプトを入力すると、自動的に明確化質問が生成されます。"
