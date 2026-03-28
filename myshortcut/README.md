# myshortcut

Claude Code の起動や日常操作を効率化するショートカット集。

## 登録済みショートカット

| エイリアス | コマンド | 説明 |
|-----------|---------|------|
| `cc` | `claude --dangerously-skip-permissions` | Claude Code を権限確認スキップモードで起動 |

## セットアップ

### macOS

`.zshrc` にエイリアスを直接追加:

```bash
echo "alias cc='claude --dangerously-skip-permissions'" >> ~/.zshrc
source ~/.zshrc
```

### Windows (WSL)

`.bashrc` または `.zshrc` に追加:

```bash
echo "alias cc='claude --dangerously-skip-permissions'" >> ~/.bashrc
source ~/.bashrc
```

zsh を使用している場合は `.bashrc` を `.zshrc` に読み替えてください。

## 使い方

```bash
# 基本起動（対話モード）
cc

# 特定ディレクトリで起動
cd /path/to/project && cc

# プロンプト付きで起動
cc -p "テストを実行して"

# 非対話モードで実行
cc -p "lint修正して" --allowedTools Edit,Bash
```

## 注意事項

- `--dangerously-skip-permissions` はすべてのツール実行を自動承認します
- 信頼できるプロジェクトでのみ使用してください
- 本番環境やセンシティブなリポジトリでは通常モード（`claude`）を推奨
