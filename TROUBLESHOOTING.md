# トラブルシューティングガイド

Everything Claude Code (ECC) プラグインの一般的な問題と解決策。

## 目次

- [メモリとコンテキストの問題](#メモリとコンテキストの問題)
- [Agent ハーネスの障害](#agent-ハーネスの障害)
- [Hook とワークフローのエラー](#hook-とワークフローのエラー)
- [インストールとセットアップ](#インストールとセットアップ)
- [パフォーマンスの問題](#パフォーマンスの問題)
- [よくあるエラーメッセージ](#よくあるエラーメッセージ)
- [ヘルプを得る](#ヘルプを得る)

---

## メモリとコンテキストの問題

### コンテキストウィンドウのオーバーフロー

**症状:** 「Context too long」エラーまたは不完全なレスポンス

**原因:**
- トークン制限を超える大きなファイルのアップロード
- 蓄積された会話履歴
- 単一セッションでの複数の大きなツール出力

**解決策:**
```bash
# 1. 会話履歴をクリアして新しく開始
# Claude Code: 「New Chat」または Cmd/Ctrl+Shift+N

# 2. 分析前にファイルサイズを縮小
head -n 100 large-file.log > sample.log

# 3. 大きな出力にはストリーミングを使用
head -n 50 large-file.txt

# 4. タスクを小さなチャンクに分割
# 悪い例: 「50ファイルすべてを分析して」
# 良い例: 「src/components/ ディレクトリのファイルを分析して」
```

### メモリ永続化の失敗

**症状:** Agent が以前のコンテキストや観察を記憶していない

**原因:**
- continuous-learning hooks の無効化
- 破損した observation ファイル
- プロジェクト検出の失敗

**解決策:**
```bash
# observation が記録されているか確認
ls ~/.claude/homunculus/projects/*/observations.jsonl

# 現在のプロジェクトのハッシュ ID を見つける
python3 - <<'PY'
import json, os
registry_path = os.path.expanduser("~/.claude/homunculus/projects.json")
with open(registry_path) as f:
    registry = json.load(f)
for project_id, meta in registry.items():
    if meta.get("root") == os.getcwd():
        print(project_id)
        break
else:
    raise SystemExit("Project hash not found in ~/.claude/homunculus/projects.json")
PY

# そのプロジェクトの最近の observation を表示
tail -20 ~/.claude/homunculus/projects/<project-hash>/observations.jsonl

# 破損した observation ファイルを再作成前にバックアップ
mv ~/.claude/homunculus/projects/<project-hash>/observations.jsonl \
  ~/.claude/homunculus/projects/<project-hash>/observations.jsonl.bak.$(date +%Y%m%d-%H%M%S)

# hooks が有効か確認
grep -r "observe" ~/.claude/settings.json
```

---

## Agent ハーネスの障害

### Agent が見つからない

**症状:** 「Agent not loaded」または「Unknown agent」エラー

**原因:**
- プラグインが正しくインストールされていない
- Agent パスの設定ミス
- マーケットプレイスと手動インストールの不一致

**解決策:**
```bash
# プラグインのインストールを確認
ls ~/.claude/plugins/cache/

# agent が存在するか確認（マーケットプレイスインストール）
ls ~/.claude/plugins/cache/*/agents/

# 手動インストールの場合、agent はここに:
ls ~/.claude/agents/  # カスタム agent のみ

# プラグインを再ロード
# Claude Code → Settings → Extensions → Reload
```

### ワークフロー実行のハング

**症状:** Agent が開始するが完了しない

**原因:**
- Agent ロジックの無限ループ
- ユーザー入力待ちでブロック
- API 待ちのネットワークタイムアウト

**解決策:**
```bash
# 1. スタックしたプロセスを確認
ps aux | grep claude

# 2. デバッグモードを有効化
export CLAUDE_DEBUG=1

# 3. タイムアウトを短く設定
export CLAUDE_TIMEOUT=30

# 4. ネットワーク接続を確認
curl -I https://api.anthropic.com
```

### ツール使用エラー

**症状:** 「Tool execution failed」またはパーミッション拒否

**原因:**
- 依存関係の不足（npm、python など）
- ファイルパーミッションの不足
- パスが見つからない

**解決策:**
```bash
# 必要なツールがインストールされているか確認
which node python3 npm git

# hook スクリプトのパーミッションを修正
chmod +x ~/.claude/plugins/cache/*/hooks/*.sh
chmod +x ~/.claude/plugins/cache/*/skills/*/hooks/*.sh

# PATH に必要なバイナリが含まれているか確認
echo $PATH
```

---

## Hook とワークフローのエラー

### Hook が発火しない

**症状:** Pre/post hooks が実行されない

**原因:**
- settings.json に hooks が登録されていない
- 無効な hook 構文
- hook スクリプトが実行可能でない

**解決策:**
```bash
# hooks が登録されているか確認
grep -A 10 '"hooks"' ~/.claude/settings.json

# hook ファイルが存在し実行可能か確認
ls -la ~/.claude/plugins/cache/*/hooks/

# hook を手動でテスト
bash ~/.claude/plugins/cache/*/hooks/pre-bash.sh <<< '{"command":"echo test"}'

# hooks を再登録（プラグイン使用の場合）
# プラグインを無効にして再度有効化
```

### Python/Node バージョンの不一致

**症状:** 「python3 not found」または「node: command not found」

**原因:**
- Python/Node がインストールされていない
- PATH が設定されていない
- Python バージョンの誤り（Windows）

**解決策:**
```bash
# Python 3 をインストール（未インストールの場合）
# macOS: brew install python3
# Ubuntu: sudo apt install python3
# Windows: python.org からダウンロード

# Node.js をインストール（未インストールの場合）
# macOS: brew install node
# Ubuntu: sudo apt install nodejs npm
# Windows: nodejs.org からダウンロード

# インストールを確認
python3 --version
node --version
npm --version

# Windows: python（python3 ではなく）が動作するか確認
python --version
```

### Dev サーバーブロッカーの誤検出

**症状:** Hook が「dev」を含む正当なコマンドをブロック

**原因:**
- ヒアドキュメントの内容がパターンマッチをトリガー
- 引数に「dev」が含まれる dev 以外のコマンド

**解決策:**
```bash
# v1.8.0+ で修正済み（PR #371）
# プラグインを最新バージョンにアップグレード

# 回避策: dev サーバーを tmux でラップ
tmux new-session -d -s dev "npm run dev"
tmux attach -t dev

# 必要に応じて hook を一時的に無効化
# ~/.claude/settings.json を編集して pre-bash hook を削除
```

---

## インストールとセットアップ

### プラグインが読み込まれない

**症状:** インストール後にプラグイン機能が利用できない

**原因:**
- マーケットプレイスキャッシュが更新されていない
- Claude Code バージョンの非互換性
- 破損したプラグインファイル

**解決策:**
```bash
# 変更前にプラグインキャッシュを調査
ls -la ~/.claude/plugins/cache/

# プラグインキャッシュを削除する代わりにバックアップ
mv ~/.claude/plugins/cache ~/.claude/plugins/cache.backup.$(date +%Y%m%d-%H%M%S)
mkdir -p ~/.claude/plugins/cache

# マーケットプレイスから再インストール
# Claude Code → Extensions → Everything Claude Code → Uninstall
# その後マーケットプレイスから再インストール

# Claude Code のバージョンを確認
claude --version
# Claude Code 2.0+ が必要

# 手動インストール（マーケットプレイスが失敗した場合）
git clone https://github.com/affaan-m/everything-claude-code.git
cp -r everything-claude-code ~/.claude/plugins/ecc
```

### パッケージマネージャの検出失敗

**症状:** 誤ったパッケージマネージャが使用される（pnpm の代わりに npm）

**原因:**
- ロックファイルが存在しない
- CLAUDE_PACKAGE_MANAGER が設定されていない
- 複数のロックファイルが検出を混乱させる

**解決策:**
```bash
# 優先パッケージマネージャをグローバルに設定
export CLAUDE_PACKAGE_MANAGER=pnpm
# ~/.bashrc または ~/.zshrc に追加

# またはプロジェクトごとに設定
echo '{"packageManager": "pnpm"}' > .claude/package-manager.json

# または package.json フィールドを使用
npm pkg set packageManager="pnpm@8.15.0"

# 警告: ロックファイルの削除はインストールされる依存関係のバージョンを変更する可能性があります。
# 先にロックファイルをコミットまたはバックアップし、フレッシュインストールと CI の再実行を行ってください。
# パッケージマネージャを意図的に切り替える場合のみ実行。
rm package-lock.json  # pnpm/yarn/bun を使用する場合
```

---

## パフォーマンスの問題

### レスポンス時間の遅延

**症状:** Agent のレスポンスに 30 秒以上かかる

**原因:**
- 大きな observation ファイル
- アクティブな hooks が多すぎる
- API へのネットワーク遅延

**解決策:**
```bash
# 大きな observation を削除する代わりにアーカイブ
archive_dir="$HOME/.claude/homunculus/archive/$(date +%Y%m%d)"
mkdir -p "$archive_dir"
find ~/.claude/homunculus/projects -name "observations.jsonl" -size +10M -exec sh -c '
  for file do
    base=$(basename "$(dirname "$file")")
    gzip -c "$file" > "'"$archive_dir"'/${base}-observations.jsonl.gz"
    : > "$file"
  done
' sh {} +

# 未使用の hooks を一時的に無効化
# ~/.claude/settings.json を編集

# アクティブな observation ファイルを小さく保つ
# 大きなアーカイブは ~/.claude/homunculus/archive/ に配置
```

### CPU 使用率の高騰

**症状:** Claude Code が CPU 100% を消費

**原因:**
- 無限 observation ループ
- 大きなディレクトリのファイル監視
- hooks のメモリリーク

**解決策:**
```bash
# 暴走プロセスを確認
top -o cpu | grep claude

# continuous learning を一時的に無効化
touch ~/.claude/homunculus/disabled

# Claude Code を再起動
# Cmd/Ctrl+Q で終了後、再度開く

# observation ファイルサイズを確認
du -sh ~/.claude/homunculus/*/
```

---

## よくあるエラーメッセージ

### "EACCES: permission denied"

```bash
# hook のパーミッションを修正
find ~/.claude/plugins -name "*.sh" -exec chmod +x {} \;

# observation ディレクトリのパーミッションを修正
chmod -R u+rwX,go+rX ~/.claude/homunculus
```

### "MODULE_NOT_FOUND"

```bash
# プラグインの依存関係をインストール
cd ~/.claude/plugins/cache/everything-claude-code
npm install

# 手動インストールの場合
cd ~/.claude/plugins/ecc
npm install
```

### "spawn UNKNOWN"

```bash
# Windows 固有: スクリプトが正しい改行コードを使用しているか確認
# CRLF を LF に変換
find ~/.claude/plugins -name "*.sh" -exec dos2unix {} \;

# dos2unix をインストール
# macOS: brew install dos2unix
# Ubuntu: sudo apt install dos2unix
```

---

## ヘルプを得る

問題が解決しない場合:

1. **GitHub Issues を確認**: [github.com/affaan-m/everything-claude-code/issues](https://github.com/affaan-m/everything-claude-code/issues)
2. **デバッグログを有効化**:
   ```bash
   export CLAUDE_DEBUG=1
   export CLAUDE_LOG_LEVEL=debug
   ```
3. **診断情報を収集**:
   ```bash
   claude --version
   node --version
   python3 --version
   echo $CLAUDE_PACKAGE_MANAGER
   ls -la ~/.claude/plugins/cache/
   ```
4. **Issue を作成**: デバッグログ、エラーメッセージ、診断情報を含めてください

---

## 関連ドキュメント

- [README.md](./README.md) - インストールと機能
- [CONTRIBUTING.md](https://github.com/affaan-m/everything-claude-code/blob/main/CONTRIBUTING.md) - 開発ガイドライン（upstream）
- [docs/](./docs/) - 詳細なドキュメント
- [examples/](./examples/) - 使用例
