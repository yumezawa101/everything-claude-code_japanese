---
name: ai-regression-testing
description: AI支援開発のためのリグレッションテスト戦略。データベース依存なしのSandboxモードAPIテスト、自動バグチェックワークフロー、同一モデルがコードの記述とレビューを行う際のAIの盲点を捕捉するパターン。
origin: ECC
---

# AI リグレッションテスト

AI支援開発に特化したテストパターン。同じモデルがコードを書いてレビューするため、自動テストでしか捕捉できない体系的な盲点が生まれる。

## 発動条件

- AIエージェント（Claude Code、Cursor、Codex）がAPIルートやバックエンドロジックを変更した場合
- バグが発見・修正され、再発を防止する必要がある場合
- プロジェクトがDB不要のテストに活用できるsandbox/mockモードを持っている場合
- コード変更後に`/bug-check`や類似のレビューコマンドを実行する場合
- 複数のコードパスが存在する場合（sandbox対本番、フィーチャーフラグなど）

## コアの問題

AIがコードを書いてから自分の作業をレビューすると、両方のステップに同じ前提を持ち込む。これにより予測可能な失敗パターンが生まれる：

```
AI writes fix → AI reviews fix → AI says "looks correct" → Bug still exists
```

**実際の例**（本番で観察）：

```
Fix 1: Added notification_settings to API response
  → Forgot to add it to the SELECT query
  → AI reviewed and missed it (same blind spot)

Fix 2: Added it to SELECT query
  → TypeScript build error (column not in generated types)
  → AI reviewed Fix 1 but didn't catch the SELECT issue

Fix 3: Changed to SELECT *
  → Fixed production path, forgot sandbox path
  → AI reviewed and missed it AGAIN (4th occurrence)

Fix 4: Test caught it instantly on first run ✅
```

パターン：**sandbox/本番パスの不整合**がAIが導入するリグレッションの第1位。

## SandboxモードAPIテスト

AIフレンドリーなアーキテクチャを持つほとんどのプロジェクトにはsandbox/mockモードがある。これが高速でDB不要のAPIテストの鍵となる。

### セットアップ（Vitest + Next.js App Router）

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.test.ts"],
    setupFiles: ["__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

```typescript
// __tests__/setup.ts
// Force sandbox mode — no database needed
process.env.SANDBOX_MODE = "true";
process.env.NEXT_PUBLIC_SUPABASE_URL = "";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
```

### Next.js APIルート用テストヘルパー

```typescript
// __tests__/helpers.ts
import { NextRequest } from "next/server";

export function createTestRequest(
  url: string,
  options?: {
    method?: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    sandboxUserId?: string;
  },
): NextRequest {
  const { method = "GET", body, headers = {}, sandboxUserId } = options || {};
  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  const reqHeaders: Record<string, string> = { ...headers };

  if (sandboxUserId) {
    reqHeaders["x-sandbox-user-id"] = sandboxUserId;
  }

  const init: { method: string; headers: Record<string, string>; body?: string } = {
    method,
    headers: reqHeaders,
  };

  if (body) {
    init.body = JSON.stringify(body);
    reqHeaders["content-type"] = "application/json";
  }

  return new NextRequest(fullUrl, init);
}

export async function parseResponse(response: Response) {
  const json = await response.json();
  return { status: response.status, json };
}
```

### リグレッションテストの書き方

重要な原則：**動作するコードではなく、発見されたバグに対してテストを書く**。

```typescript
// __tests__/api/user/profile.test.ts
import { describe, it, expect } from "vitest";
import { createTestRequest, parseResponse } from "../../helpers";
import { GET, PATCH } from "@/app/api/user/profile/route";

// Define the contract — what fields MUST be in the response
const REQUIRED_FIELDS = [
  "id",
  "email",
  "full_name",
  "phone",
  "role",
  "created_at",
  "avatar_url",
  "notification_settings",  // ← Added after bug found it missing
];

describe("GET /api/user/profile", () => {
  it("returns all required fields", async () => {
    const req = createTestRequest("/api/user/profile");
    const res = await GET(req);
    const { status, json } = await parseResponse(res);

    expect(status).toBe(200);
    for (const field of REQUIRED_FIELDS) {
      expect(json.data).toHaveProperty(field);
    }
  });

  // Regression test — this exact bug was introduced by AI 4 times
  it("notification_settings is not undefined (BUG-R1 regression)", async () => {
    const req = createTestRequest("/api/user/profile");
    const res = await GET(req);
    const { json } = await parseResponse(res);

    expect("notification_settings" in json.data).toBe(true);
    const ns = json.data.notification_settings;
    expect(ns === null || typeof ns === "object").toBe(true);
  });
});
```

### Sandbox/本番のパリティテスト

最も一般的なAIリグレッション：本番パスを修正してsandboxパスを忘れる（またはその逆）。

```typescript
// Test that sandbox responses match the expected contract
describe("GET /api/user/messages (conversation list)", () => {
  it("includes partner_name in sandbox mode", async () => {
    const req = createTestRequest("/api/user/messages", {
      sandboxUserId: "user-001",
    });
    const res = await GET(req);
    const { json } = await parseResponse(res);

    // This caught a bug where partner_name was added
    // to production path but not sandbox path
    if (json.data.length > 0) {
      for (const conv of json.data) {
        expect("partner_name" in conv).toBe(true);
      }
    }
  });
});
```

## バグチェックワークフローへのテスト統合

### カスタムコマンド定義

```markdown
<!-- .claude/commands/bug-check.md -->
# Bug Check

## Step 1: Automated Tests (mandatory, cannot skip)

Run these commands FIRST before any code review:

    npm run test       # Vitest test suite
    npm run build      # TypeScript type check + build

- If tests fail → report as highest priority bug
- If build fails → report type errors as highest priority
- Only proceed to Step 2 if both pass

## Step 2: Code Review (AI review)

1. Sandbox / production path consistency
2. API response shape matches frontend expectations
3. SELECT clause completeness
4. Error handling with rollback
5. Optimistic update race conditions

## Step 3: For each bug fixed, propose a regression test
```

### ワークフロー

```
User: "バグチェックして" (or "/bug-check")
  │
  ├─ Step 1: npm run test
  │   ├─ FAIL → Bug found mechanically (no AI judgment needed)
  │   └─ PASS → Continue
  │
  ├─ Step 2: npm run build
  │   ├─ FAIL → Type error found mechanically
  │   └─ PASS → Continue
  │
  ├─ Step 3: AI code review (with known blind spots in mind)
  │   └─ Findings reported
  │
  └─ Step 4: For each fix, write a regression test
      └─ Next bug-check catches if fix breaks
```

## よくあるAIリグレッションパターン

### パターン1: Sandbox/本番パスの不一致

**頻度**: 最多（4件中3件のリグレッションで観察）

```typescript
// ❌ AI adds field to production path only
if (isSandboxMode()) {
  return { data: { id, email, name } };  // Missing new field
}
// Production path
return { data: { id, email, name, notification_settings } };

// ✅ Both paths must return the same shape
if (isSandboxMode()) {
  return { data: { id, email, name, notification_settings: null } };
}
return { data: { id, email, name, notification_settings } };
```

**捕捉するテスト**：

```typescript
it("sandbox and production return same fields", async () => {
  // In test env, sandbox mode is forced ON
  const res = await GET(createTestRequest("/api/user/profile"));
  const { json } = await parseResponse(res);

  for (const field of REQUIRED_FIELDS) {
    expect(json.data).toHaveProperty(field);
  }
});
```

### パターン2: SELECT句の欠落

**頻度**: Supabase/Prismaで新しいカラムを追加する際によくある

```typescript
// ❌ New column added to response but not to SELECT
const { data } = await supabase
  .from("users")
  .select("id, email, name")  // notification_settings not here
  .single();

return { data: { ...data, notification_settings: data.notification_settings } };
// → notification_settings is always undefined

// ✅ Use SELECT * or explicitly include new columns
const { data } = await supabase
  .from("users")
  .select("*")
  .single();
```

### パターン3: エラー状態の漏洩

**頻度**: 中程度 — 既存コンポーネントにエラーハンドリングを追加する際

```typescript
// ❌ Error state set but old data not cleared
catch (err) {
  setError("Failed to load");
  // reservations still shows data from previous tab!
}

// ✅ Clear related state on error
catch (err) {
  setReservations([]);  // Clear stale data
  setError("Failed to load");
}
```

### パターン4: 適切なロールバックのない楽観的更新

```typescript
// ❌ No rollback on failure
const handleRemove = async (id: string) => {
  setItems(prev => prev.filter(i => i.id !== id));
  await fetch(`/api/items/${id}`, { method: "DELETE" });
  // If API fails, item is gone from UI but still in DB
};

// ✅ Capture previous state and rollback on failure
const handleRemove = async (id: string) => {
  const prevItems = [...items];
  setItems(prev => prev.filter(i => i.id !== id));
  try {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("API error");
  } catch {
    setItems(prevItems);  // Rollback
    alert("削除に失敗しました");
  }
};
```

## 戦略：バグが見つかった場所でテストする

100%カバレッジを目指さない。代わりに：

```
Bug found in /api/user/profile     → Write test for profile API
Bug found in /api/user/messages    → Write test for messages API
Bug found in /api/user/favorites   → Write test for favorites API
No bug in /api/user/notifications  → Don't write test (yet)
```

**AI開発でこれが機能する理由：**

1. AIは**同じカテゴリの間違い**を繰り返す傾向がある
2. バグは複雑な領域に集中する（認証、マルチパスロジック、状態管理）
3. テスト化されると、そのリグレッションは**二度と発生しない**
4. テスト数はバグ修正に伴って自然に増加する — 無駄な労力がない

## クイックリファレンス

| AIリグレッションパターン | テスト戦略 | 優先度 |
|---|---|---|
| Sandbox/本番の不一致 | sandboxモードで同じレスポンス形状をアサート | 高 |
| SELECT句の欠落 | レスポンス内のすべての必須フィールドをアサート | 高 |
| エラー状態の漏洩 | エラー時の状態クリーンアップをアサート | 中 |
| ロールバックの欠如 | API失敗時の状態復元をアサート | 中 |
| 型キャストによるnullマスク | フィールドがundefinedでないことをアサート | 中 |

## DO / DON'T

**DO:**
- バグ発見直後にテストを書く（可能であれば修正前に）
- 実装ではなくAPIレスポンスの形状をテストする
- バグチェックの最初のステップとしてテストを実行する
- テストを高速に保つ（sandboxモードで合計1秒未満）
- テストには防止するバグの名前を付ける（例：「BUG-R1 regression」）

**DON'T:**
- バグが一度も発生していないコードにテストを書く
- AI自己レビューを自動テストの代替として信頼する
- 「ただのモックデータだから」とsandboxパスのテストをスキップする
- ユニットテストで十分な場合に統合テストを書く
- カバレッジ率を目指す — リグレッション防止を目指す
