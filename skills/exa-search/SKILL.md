---
name: exa-search
description: Exa MCPによるニューラル検索（Web、コード、企業リサーチ）。Web検索、コード例、企業情報、人物検索、Exaのニューラル検索エンジンによるAI駆動の深いリサーチが必要な場合に使用。
origin: ECC
---

# Exa Search

Exa MCP サーバーを介した Web コンテンツ、コード、企業、人物のニューラル検索。

## 発動条件

- ユーザーが最新の Web 情報やニュースを必要としている
- コード例、API ドキュメント、技術リファレンスの検索
- 企業、競合他社、市場プレイヤーの調査
- 特定分野の専門家プロフィールや人物の検索
- 開発タスクのバックグラウンドリサーチの実行
- ユーザーが「検索して」「調べて」「探して」「最新情報は」と言った場合

## MCP 要件

Exa MCP サーバーの設定が必要です。`~/.claude.json` に以下を追加してください：

```json
"exa-web-search": {
  "command": "npx",
  "args": ["-y", "exa-mcp-server"],
  "env": { "EXA_API_KEY": "YOUR_EXA_API_KEY_HERE" }
}
```

API キーは [exa.ai](https://exa.ai) で取得できます。
このリポジトリの現在の Exa セットアップは、ここで公開されているツールサーフェスを文書化しています: `web_search_exa` と `get_code_context_exa`。
Exa サーバーが追加のツールを公開している場合、ドキュメントやプロンプトで使用する前に正確なツール名を確認してください。

## コアツール

### web_search_exa
最新情報、ニュース、事実の一般的な Web 検索。

```
web_search_exa(query: "latest AI developments 2026", numResults: 5)
```

**パラメータ:**

| パラメータ | 型 | デフォルト | 備考 |
|-------|------|---------|-------|
| `query` | string | 必須 | 検索クエリ |
| `numResults` | number | 8 | 結果数 |
| `type` | string | `auto` | 検索モード |
| `livecrawl` | string | `fallback` | 必要に応じてライブクロールを優先 |
| `category` | string | なし | `company` や `research paper` などのオプションフォーカス |

### get_code_context_exa
GitHub、Stack Overflow、ドキュメントサイトからコード例やドキュメントを検索。

```
get_code_context_exa(query: "Python asyncio patterns", tokensNum: 3000)
```

**パラメータ:**

| パラメータ | 型 | デフォルト | 備考 |
|-------|------|---------|-------|
| `query` | string | 必須 | コードまたは API 検索クエリ |
| `tokensNum` | number | 5000 | コンテンツトークン数（1000-50000） |

## 使用パターン

### クイックルックアップ
```
web_search_exa(query: "Node.js 22 new features", numResults: 3)
```

### コードリサーチ
```
get_code_context_exa(query: "Rust error handling patterns Result type", tokensNum: 3000)
```

### 企業・人物リサーチ
```
web_search_exa(query: "Vercel funding valuation 2026", numResults: 3, category: "company")
web_search_exa(query: "site:linkedin.com/in AI safety researchers Anthropic", numResults: 5)
```

### 技術的な深掘り
```
web_search_exa(query: "WebAssembly component model status and adoption", numResults: 5)
get_code_context_exa(query: "WebAssembly component model examples", tokensNum: 4000)
```

## ヒント

- 最新情報、企業検索、幅広い発見には `web_search_exa` を使用する
- `site:`、引用フレーズ、`intitle:` などの検索演算子で結果を絞り込む
- 焦点を絞ったコードスニペットには低い `tokensNum`（1000-2000）を、包括的なコンテキストには高い値（5000+）を使用する
- 一般的な Web ページではなく API の使用方法やコード例が必要な場合は `get_code_context_exa` を使用する

## 関連スキル

- `deep-research` -- firecrawl + exa を組み合わせた完全なリサーチワークフロー
- `market-research` -- 意思決定フレームワークを備えたビジネス指向のリサーチ
