---
description: Playwright を使用してエンドツーエンドテストを生成・実行します。テストジャーニーの作成、テスト実行、スクリーンショット/ビデオ/トレースのキャプチャ、アーティファクトのアップロードを行います。
---

# E2E コマンド

このコマンドは **e2e-runner** エージェントを呼び出して、Playwright を使用してエンドツーエンドテストを生成、保守、実行します。

## このコマンドの機能

1. **テストジャーニー生成** - ユーザーフローの Playwright テストを作成
2. **E2E テスト実行** - 複数ブラウザでテストを実行
3. **アーティファクトキャプチャ** - 失敗時のスクリーンショット、ビデオ、トレース
4. **結果アップロード** - HTML レポートと JUnit XML
5. **不安定なテスト識別** - 不安定なテストを隔離

## 使用するタイミング

以下の場合に `/e2e` を使用:
- 重要なユーザージャーニーのテスト（ログイン、取引、支払い）
- マルチステップフローのエンドツーエンド動作検証
- UI インタラクションとナビゲーションのテスト
- フロントエンドとバックエンド間の統合検証
- 本番デプロイの準備

## 動作方法

e2e-runner エージェントは以下を実行:

1. **ユーザーフローを分析**してテストシナリオを特定
2. **Page Object Model パターンを使用して Playwright テストを生成**
3. **複数ブラウザ（Chrome、Firefox、Safari）でテストを実行**
4. **失敗をキャプチャ**（スクリーンショット、ビデオ、トレース付き）
5. **結果とアーティファクトを含むレポートを生成**
6. **不安定なテストを特定**して修正を推奨

## 使用例

````
User: /e2e Test the market search and view flow

Agent (e2e-runner):
# E2E テスト生成: マーケット検索と表示フロー

## 特定されたテストシナリオ

**ユーザージャーニー:** マーケット検索 → 結果表示 → マーケットクリック → 詳細表示

**テストカバレッジ:**
1. マーケットページに遷移
2. セマンティック検索を実行
3. 検索結果を検証
4. 最初の結果をクリック
5. マーケット詳細ページの読み込みを検証
6. チャートの描画を検証

## 生成されたテストコード

```typescript
// tests/e2e/markets/search-and-view.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'
import { MarketDetailsPage } from '../../pages/MarketDetailsPage'

test.describe('Market Search and View Flow', () => {
  test('user can search markets and view details', async ({ page }) => {
    // 1. Navigate to markets page
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Verify page loaded
    await expect(page).toHaveTitle(/Markets/)
    await expect(page.locator('h1')).toContainText('Markets')

    // 2. Perform semantic search
    await marketsPage.searchMarkets('election')

    // Wait for API response
    await page.waitForResponse(resp =>
      resp.url().includes('/api/markets/search') && resp.status() === 200
    )

    // 3. Verify search results
    const marketCards = marketsPage.marketCards
    await expect(marketCards.first()).toBeVisible()
    const resultCount = await marketCards.count()
    expect(resultCount).toBeGreaterThan(0)

    // Take screenshot of search results
    await page.screenshot({ path: 'artifacts/search-results.png' })

    // 4. Click on first result
    const firstMarketTitle = await marketCards.first().textContent()
    await marketCards.first().click()

    // 5. Verify market details page loads
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)

    const detailsPage = new MarketDetailsPage(page)
    await expect(detailsPage.marketName).toBeVisible()
    await expect(detailsPage.marketDescription).toBeVisible()

    // 6. Verify chart renders
    await expect(detailsPage.priceChart).toBeVisible()

    // Verify market name matches
    const detailsTitle = await detailsPage.marketName.textContent()
    expect(detailsTitle?.toLowerCase()).toContain(
      firstMarketTitle?.toLowerCase().substring(0, 20) || ''
    )

    // Take screenshot of market details
    await page.screenshot({ path: 'artifacts/market-details.png' })
  })

  test('search with no results shows empty state', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Search for non-existent market
    await marketsPage.searchMarkets('xyznonexistentmarket123456')

    // Verify empty state
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-results"]')).toContainText(
      /no.*results|no.*markets/i
    )

    const marketCount = await marketsPage.marketCards.count()
    expect(marketCount).toBe(0)
  })

  test('can clear search and see all markets again', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Initial market count
    const initialCount = await marketsPage.marketCards.count()

    // Perform search
    await marketsPage.searchMarkets('trump')
    await page.waitForLoadState('networkidle')

    // Verify filtered results
    const filteredCount = await marketsPage.marketCards.count()
    expect(filteredCount).toBeLessThan(initialCount)

    // Clear search
    await marketsPage.searchInput.clear()
    await page.waitForLoadState('networkidle')

    // Verify all markets shown again
    const finalCount = await marketsPage.marketCards.count()
    expect(finalCount).toBe(initialCount)
  })
})
```
````

## テスト実行

```bash
# 生成されたテストを実行
npx playwright test tests/e2e/markets/search-and-view.spec.ts

Running 3 tests using 3 workers

  ✓  [chromium] › search-and-view.spec.ts:5:3 › user can search markets and view details (4.2s)
  ✓  [chromium] › search-and-view.spec.ts:52:3 › search with no results shows empty state (1.8s)
  ✓  [chromium] › search-and-view.spec.ts:67:3 › can clear search and see all markets again (2.9s)

  3 passed (9.1s)

Artifacts generated:
- artifacts/search-results.png
- artifacts/market-details.png
- playwright-report/index.html
```

## テストアーティファクト

テスト実行時に以下のアーティファクトがキャプチャされます:

**全テスト共通:**
- タイムラインと結果付き HTML レポート
- CI 統合用の JUnit XML

**失敗時のみ:**
- 失敗状態のスクリーンショット
- テストのビデオ録画
- デバッグ用トレースファイル（ステップバイステップのリプレイ）
- ネットワークログ
- コンソールログ

## アーティファクトの閲覧

```bash
# ブラウザで HTML レポートを表示
npx playwright show-report

# 特定のトレースファイルを表示
npx playwright show-trace artifacts/trace-abc123.zip

# スクリーンショットは artifacts/ ディレクトリに保存
open artifacts/search-results.png
```

## 不安定なテスト検出

テストが断続的に失敗する場合:

```
FLAKY TEST DETECTED: tests/e2e/markets/trade.spec.ts

Test passed 7/10 runs (70% pass rate)

Common failure:
"Timeout waiting for element '[data-testid="confirm-btn"]'"

Recommended fixes:
1. Add explicit wait: await page.waitForSelector('[data-testid="confirm-btn"]')
2. Increase timeout: { timeout: 10000 }
3. Check for race conditions in component
4. Verify element is not hidden by animation

Quarantine recommendation: Mark as test.fixme() until fixed
```

## ブラウザ設定

デフォルトでは複数ブラウザでテストを実行:
- Chromium（デスクトップ Chrome）
- Firefox（デスクトップ）
- WebKit（デスクトップ Safari）
- Mobile Chrome（オプション）

`playwright.config.ts` で設定してブラウザを調整します。

## CI/CD 統合

CI パイプラインに追加:

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## ベストプラクティス

**推奨事項:**
- 保守性を高めるために Page Object Model を使用
- セレクタに data-testid 属性を使用
- 任意のタイムアウトではなく API レスポンスを待機
- 重要なユーザージャーニーのエンドツーエンドテスト
- main にマージする前にテストを実行
- テスト失敗時にアーティファクトをレビュー

**避けるべき事項:**
- 不安定なセレクタの使用（CSS クラスは変わる可能性がある）
- 実装の詳細のテスト
- 本番環境に対するテスト実行
- 不安定なテストの無視
- 失敗時のアーティファクトレビューのスキップ
- E2E テストですべてのエッジケースをテスト（単体テストを使用）

## 他のコマンドとの統合

- `/plan` を使用してテストする重要なジャーニーを特定
- `/tdd` を単体テストに使用（より速く、より細粒度）
- `/e2e` を統合とユーザージャーニーテストに使用
- `/code-review` を使用してテスト品質を検証

## 関連エージェント

このコマンドは ECC が提供する `e2e-runner` エージェントを呼び出します。

手動インストールの場合、ソースファイルは以下にあります:
`agents/e2e-runner.md`

## クイックコマンド

```bash
# すべての E2E テストを実行
npx playwright test

# 特定のテストファイルを実行
npx playwright test tests/e2e/markets/search.spec.ts

# ヘッドモードで実行（ブラウザ表示）
npx playwright test --headed

# テストをデバッグ
npx playwright test --debug

# テストコードを生成
npx playwright codegen http://localhost:3000

# レポートを表示
npx playwright show-report
```
