---
name: bun-runtime
description: ランタイム、パッケージマネージャ、バンドラー、テストランナーとしてのBun。Bun vs Nodeの選択基準、移行ノート、Vercelサポート。
origin: ECC
---

# Bun Runtime

Bunは高速なオールインワンJavaScriptランタイムおよびツールキット：ランタイム、パッケージマネージャ、バンドラー、テストランナー。

## 使用タイミング

- **Bunを推奨**：新規JS/TSプロジェクト、インストール/実行速度が重要なスクリプト、BunランタイムでのVercelデプロイ、単一ツールチェーン（実行 + インストール + テスト + ビルド）が必要な場合。
- **Nodeを推奨**：最大限のエコシステム互換性、Nodeを前提とするレガシーツール、既知のBun問題がある依存関係がある場合。

Bunの導入、Nodeからの移行、Bunスクリプト/テストの作成やデバッグ、Vercelやその他のプラットフォームでのBun設定時に使用する。

## 仕組み

- **ランタイム**: Node互換のドロップインランタイム（JavaScriptCore上に構築、Zig実装）。
- **パッケージマネージャ**: `bun install`はnpm/yarnより大幅に高速。ロックファイルは現在のBunではデフォルトで`bun.lock`（テキスト）、古いバージョンでは`bun.lockb`（バイナリ）。
- **バンドラー**: アプリとライブラリ向けの組み込みバンドラーとトランスパイラ。
- **テストランナー**: Jest互換APIの組み込み`bun test`。

**Nodeからの移行**: `node script.js`を`bun run script.js`または`bun script.js`に置き換える。`npm install`の代わりに`bun install`を実行。ほとんどのパッケージが動作する。npmスクリプトには`bun run`、npxスタイルの一回限りの実行には`bun x`を使用。Node組み込みモジュールはサポートされているが、パフォーマンス向上のためBun APIが存在する場合はそちらを優先する。

**Vercel**: プロジェクト設定でランタイムをBunに設定。ビルド：`bun run build`または`bun build ./src/index.ts --outdir=dist`。インストール：再現可能なデプロイには`bun install --frozen-lockfile`。

## 使用例

### 実行とインストール

```bash
# Install dependencies (creates/updates bun.lock or bun.lockb)
bun install

# Run a script or file
bun run dev
bun run src/index.ts
bun src/index.ts
```

### スクリプトと環境変数

```bash
bun run --env-file=.env dev
FOO=bar bun run script.ts
```

### テスト

```bash
bun test
bun test --watch
```

```typescript
// test/example.test.ts
import { expect, test } from "bun:test";

test("add", () => {
  expect(1 + 2).toBe(3);
});
```

### ランタイムAPI

```typescript
const file = Bun.file("package.json");
const json = await file.json();

Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello");
  },
});
```

## ベストプラクティス

- 再現可能なインストールのためにロックファイル（`bun.lock`または`bun.lockb`）をコミットする。
- スクリプトには`bun run`を優先する。TypeScriptの場合、Bunはネイティブで`.ts`を実行する。
- 依存関係を最新に保つ。Bunとエコシステムは急速に進化している。
