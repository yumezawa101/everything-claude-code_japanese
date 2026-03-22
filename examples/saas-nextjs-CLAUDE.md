# SaaS アプリケーション -- プロジェクト CLAUDE.md

> Next.js + Supabase + Stripe SaaS アプリケーションの実践的な例。
> プロジェクトルートにコピーして、スタックに合わせてカスタマイズしてください。

## プロジェクト概要

**技術スタック:** Next.js 15 (App Router), TypeScript, Supabase（認証 + DB）, Stripe（課金）, Tailwind CSS, Playwright（E2E）

**アーキテクチャ:** デフォルトで Server Components。Client Components はインタラクティビティのみ。Webhook には API Routes、ミューテーションには Server Actions。

## 重要なルール

### データベース

- すべてのクエリは RLS 有効の Supabase クライアントを使用 -- RLS を決してバイパスしない
- マイグレーションは `supabase/migrations/` -- データベースを直接変更しない
- `select('*')` ではなく明示的なカラムリストで `select()` を使用
- ユーザー向けクエリには無制限の結果を防ぐために `.limit()` を必ず含める

### 認証

- Server Components では `@supabase/ssr` の `createServerClient()` を使用
- Client Components では `@supabase/ssr` の `createBrowserClient()` を使用
- 保護されたルートは `getUser()` をチェック -- 認証に `getSession()` のみを信頼しない
- `middleware.ts` のミドルウェアがすべてのリクエストで認証トークンをリフレッシュ

### 課金

- Stripe Webhook ハンドラは `app/api/webhooks/stripe/route.ts`
- クライアント側の価格データを決して信頼しない -- 常にサーバー側で Stripe から取得
- サブスクリプションステータスは Webhook で同期された `subscription_status` カラムで確認
- 無料ティアユーザー: 3 プロジェクト、100 API コール/日

### コードスタイル

- コードやコメントに絵文字禁止
- 不変パターンのみ -- スプレッド演算子、決してミューテーションしない
- Server Components: `'use client'` ディレクティブなし、`useState`/`useEffect` なし
- Client Components: 先頭に `'use client'`、最小限に -- ロジックを hooks に抽出
- すべての入力バリデーション（API Routes、フォーム、環境変数）に Zod スキーマを推奨

## ファイル構造

```
src/
  app/
    (auth)/          # 認証ページ（ログイン、サインアップ、パスワード忘れ）
    (dashboard)/     # 保護されたダッシュボードページ
    api/
      webhooks/      # Stripe、Supabase Webhook
    layout.tsx       # プロバイダー付きルートレイアウト
  components/
    ui/              # Shadcn/ui コンポーネント
    forms/           # バリデーション付きフォームコンポーネント
    dashboard/       # ダッシュボード固有コンポーネント
  hooks/             # カスタム React hooks
  lib/
    supabase/        # Supabase クライアントファクトリ
    stripe/          # Stripe クライアントとヘルパー
    utils.ts         # 汎用ユーティリティ
  types/             # 共有 TypeScript 型
supabase/
  migrations/        # データベースマイグレーション
  seed.sql           # 開発用シードデータ
```

## 主要パターン

### API レスポンス形式

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

### Server Action パターン

```typescript
'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const schema = z.object({
  name: z.string().min(1).max(100),
})

export async function createProject(formData: FormData) {
  const parsed = schema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('projects')
    .insert({ name: parsed.data.name, user_id: user.id })
    .select('id, name, created_at')
    .single()

  if (error) return { success: false, error: 'Failed to create project' }
  return { success: true, data }
}
```

## 環境変数

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # サーバー専用、クライアントに露出させない

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# アプリ
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## テスト戦略

```bash
/tdd                    # 新機能のユニット + 統合テスト
/e2e                    # 認証フロー、課金、ダッシュボードの Playwright テスト
/test-coverage          # 80% 以上のカバレッジを確認
```

### 重要な E2E フロー

1. サインアップ → メール確認 → 最初のプロジェクト作成
2. ログイン → ダッシュボード → CRUD 操作
3. プランアップグレード → Stripe チェックアウト → サブスクリプション有効化
4. Webhook: サブスクリプションキャンセル → 無料ティアにダウングレード

## ECC ワークフロー

```bash
# 機能の計画
/plan "Add team invitations with email notifications"

# TDD で開発
/tdd

# コミット前
/code-review
/security-scan

# リリース前
/e2e
/test-coverage
```

## Git ワークフロー

- `feat:` 新機能、`fix:` バグ修正、`refactor:` コード変更
- `main` からフィーチャーブランチ、PR 必須
- CI: lint、型チェック、ユニットテスト、E2E テスト
- デプロイ: PR で Vercel プレビュー、`main` マージで本番
