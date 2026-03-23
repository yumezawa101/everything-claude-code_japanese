---
name: documentation-lookup
description: トレーニングデータの代わりにContext7 MCPを介して最新のライブラリとフレームワークのドキュメントを使用する。セットアップの質問、APIリファレンス、コード例、またはユーザーがフレームワーク名（React、Next.js、Prismaなど）を挙げた場合に発動。
origin: ECC
---

# ドキュメント検索（Context7）

ユーザーがライブラリ、フレームワーク、またはAPIについて質問した場合、トレーニングデータに頼るのではなく、Context7 MCP（`resolve-library-id` と `query-docs` ツール）を介して最新のドキュメントを取得する。

## コアコンセプト

- **Context7**: ライブドキュメントを公開するMCPサーバー。ライブラリやAPIに関してはトレーニングデータの代わりにこれを使用する。
- **resolve-library-id**: ライブラリ名とクエリからContext7互換のライブラリID（例: `/vercel/next.js`）を返す。
- **query-docs**: 指定されたライブラリIDと質問に対するドキュメントとコードスニペットを取得する。有効なライブラリIDを取得するために、必ず先に resolve-library-id を呼び出すこと。

## 使用タイミング

以下の場合に発動する：

- セットアップや設定に関する質問（例: 「Next.jsのミドルウェアはどう設定しますか？」）
- ライブラリに依存するコードのリクエスト（「Prismaでクエリを書いて...」）
- APIやリファレンス情報が必要な場合（「Supabaseの認証メソッドは？」）
- 特定のフレームワークやライブラリへの言及（React、Vue、Svelte、Express、Tailwind、Prisma、Supabase など）

ライブラリ、フレームワーク、またはAPIの正確で最新の動作に依存するリクエストの場合は常にこのスキルを使用する。Context7 MCPが設定されているハーネス（Claude Code、Cursor、Codex など）全体で適用される。

## 動作の仕組み

### ステップ1: ライブラリIDの解決

以下のパラメータで **resolve-library-id** MCPツールを呼び出す：

- **libraryName**: ユーザーの質問から取得したライブラリまたはプロダクト名（例: `Next.js`、`Prisma`、`Supabase`）。
- **query**: ユーザーの質問全文。これにより結果の関連性ランキングが向上する。

ドキュメントをクエリする前に、Context7互換のライブラリID（`/org/project` または `/org/project/version` 形式）を取得する必要がある。このステップで有効なライブラリIDを取得せずに query-docs を呼び出してはならない。

### ステップ2: 最適な一致の選択

解決結果から、以下の基準で1つの結果を選択する：

- **名前の一致**: ユーザーが求めたものと完全一致または最も近い一致を優先する。
- **ベンチマークスコア**: スコアが高いほどドキュメントの品質が良いことを示す（最高は100）。
- **ソースの信頼性**: 利用可能な場合、High または Medium の信頼性を優先する。
- **バージョン**: ユーザーがバージョンを指定した場合（例: 「React 19」、「Next.js 15」）、リストにバージョン固有のライブラリID（例: `/org/project/v1.2.0`）があればそれを優先する。

### ステップ3: ドキュメントの取得

以下のパラメータで **query-docs** MCPツールを呼び出す：

- **libraryId**: ステップ2で選択したContext7ライブラリID（例: `/vercel/next.js`）。
- **query**: ユーザーの具体的な質問またはタスク。関連するスニペットを取得するために具体的に記述する。

制限: 1つの質問につき query-docs（または resolve-library-id）を3回以上呼び出さないこと。3回呼び出しても回答が不明確な場合は、不確実性を明示し、推測するのではなく手持ちの最良の情報を使用する。

### ステップ4: ドキュメントの活用

- 取得した最新の情報を使用してユーザーの質問に回答する。
- 役立つ場合はドキュメントからの関連コード例を含める。
- 重要な場合はライブラリやバージョンを明記する（例: 「Next.js 15では...」）。

## 使用例

### 例: Next.js ミドルウェア

1. `libraryName: "Next.js"`、`query: "How do I set up Next.js middleware?"` で **resolve-library-id** を呼び出す。
2. 結果から、名前とベンチマークスコアで最適な一致（例: `/vercel/next.js`）を選択する。
3. `libraryId: "/vercel/next.js"`、`query: "How do I set up Next.js middleware?"` で **query-docs** を呼び出す。
4. 返されたスニペットとテキストを使用して回答する。関連する場合はドキュメントからの最小限の `middleware.ts` の例を含める。

### 例: Prisma クエリ

1. `libraryName: "Prisma"`、`query: "How do I query with relations?"` で **resolve-library-id** を呼び出す。
2. 公式のPrismaライブラリID（例: `/prisma/prisma`）を選択する。
3. その `libraryId` とクエリで **query-docs** を呼び出す。
4. Prisma Clientのパターン（例: `include` または `select`）をドキュメントからの短いコードスニペットとともに返す。

### 例: Supabase 認証メソッド

1. `libraryName: "Supabase"`、`query: "What are the auth methods?"` で **resolve-library-id** を呼び出す。
2. SupabaseドキュメントのライブラリIDを選択する。
3. **query-docs** を呼び出し、認証メソッドを要約して取得したドキュメントからの最小限の例を示す。

## ベストプラクティス

- **具体的に**: 関連性を高めるため、可能な限りユーザーの質問全文をクエリとして使用する。
- **バージョン認識**: ユーザーがバージョンを指定した場合、解決ステップで利用可能なバージョン固有のライブラリIDを使用する。
- **公式ソースを優先**: 複数の一致がある場合、コミュニティフォークよりも公式または主要パッケージを優先する。
- **機密データの除外**: Context7に送信するクエリからAPIキー、パスワード、トークン、その他のシークレットを除去する。resolve-library-id や query-docs に渡す前に、ユーザーの質問にシークレットが含まれている可能性を考慮する。
