---
name: nuxt4-patterns
description: Nuxt 4開発パターン -- composables、サーバーAPI、状態管理、NuxtUIコンポーネント。Nuxt/Vue.jsアプリケーションの構築時に使用。
origin: ECC
---

# Nuxt 4 パターン

SSR、ハイブリッドレンダリング、ルートルール、ページレベルのデータフェッチを使用する Nuxt 4 アプリの構築やデバッグ時に使用します。

## 発動条件

- サーバー HTML とクライアント状態間のハイドレーションミスマッチ
- プリレンダー、SWR、ISR、クライアントオンリーセクションなどのルートレベルのレンダリング判断
- 遅延読み込み、遅延ハイドレーション、ペイロードサイズに関するパフォーマンス作業
- `useFetch`、`useAsyncData`、`$fetch` を使用したページやコンポーネントのデータフェッチ
- ルートパラメータ、ミドルウェア、SSR/クライアントの違いに関連する Nuxt ルーティングの問題

## ハイドレーションの安全性

- 最初のレンダリングを決定的に保つ。`Date.now()`、`Math.random()`、ブラウザ専用 API、ストレージの読み取りを SSR レンダリングされるテンプレートの状態に直接配置しないこと。
- サーバーが同じマークアップを生成できない場合、ブラウザ専用のロジックは `onMounted()`、`import.meta.client`、`ClientOnly`、または `.client.vue` コンポーネントの後に移動する。
- `vue-router` のものではなく、Nuxt の `useRoute()` composable を使用する。
- SSR レンダリングされるマークアップを `route.fullPath` で駆動しないこと。URL フラグメントはクライアント専用であり、ハイドレーションミスマッチを引き起こす可能性がある。
- `ssr: false` は真にブラウザ専用の領域のためのエスケープハッチとして扱い、ミスマッチのデフォルトの修正として使用しないこと。

## データフェッチ

- ページやコンポーネントでの SSR セーフな API 読み取りには `await useFetch()` を優先する。サーバーでフェッチしたデータを Nuxt ペイロードに転送し、ハイドレーション時の二重フェッチを回避する。
- フェッチャーが単純な `$fetch()` 呼び出しでない場合、カスタムキーが必要な場合、または複数の非同期ソースを合成する場合は `useAsyncData()` を使用する。
- キャッシュの再利用と予測可能なリフレッシュ動作のために `useAsyncData()` に安定したキーを付与する。
- `useAsyncData()` のハンドラーは副作用を含まないようにする。SSR とハイドレーション中に実行される可能性がある。
- ユーザートリガーの書き込みやクライアント専用のアクションには `$fetch()` を使用し、SSR からハイドレーションされるべきトップレベルのページデータには使用しないこと。
- ナビゲーションをブロックすべきでないクリティカルでないデータには `lazy: true`、`useLazyFetch()`、または `useLazyAsyncData()` を使用する。UI で `status === 'pending'` を処理すること。
- SEO や最初の描画に不要なデータにのみ `server: false` を使用する。
- `pick` でペイロードサイズを削減し、深いリアクティビティが不要な場合はより浅いペイロードを優先する。

```ts
const route = useRoute()

const { data: article, status, error, refresh } = await useAsyncData(
  () => `article:${route.params.slug}`,
  () => $fetch(`/api/articles/${route.params.slug}`),
)

const { data: comments } = await useFetch(`/api/articles/${route.params.slug}/comments`, {
  lazy: true,
  server: false,
})
```

## ルートルール

レンダリングとキャッシュ戦略には `nuxt.config.ts` の `routeRules` を優先する：

```ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/products/**': { swr: 3600 },
    '/blog/**': { isr: true },
    '/admin/**': { ssr: false },
    '/api/**': { cache: { maxAge: 60 * 60 } },
  },
})
```

- `prerender`: ビルド時に静的 HTML を生成
- `swr`: キャッシュされたコンテンツを提供し、バックグラウンドで再検証
- `isr`: 対応プラットフォームでのインクリメンタル静的再生成
- `ssr: false`: クライアントレンダリングされるルート
- `cache` または `redirect`: Nitro レベルのレスポンス動作

ルートルールはグローバルではなくルートグループごとに設定する。マーケティングページ、カタログ、ダッシュボード、API には通常それぞれ異なる戦略が必要。

## 遅延読み込みとパフォーマンス

- Nuxt は既にルートごとにページをコード分割している。コンポーネント分割をマイクロ最適化する前に、ルート境界を意味のあるものに保つ。
- クリティカルでないコンポーネントを動的インポートするには `Lazy` プレフィックスを使用する。
- UI が実際に必要になるまでチャンクが読み込まれないように、遅延コンポーネントを `v-if` で条件付きレンダリングする。
- ファーストビュー以下やクリティカルでないインタラクティブ UI には遅延ハイドレーションを使用する。

```vue
<template>
  <LazyRecommendations v-if="showRecommendations" />
  <LazyProductGallery hydrate-on-visible />
</template>
```

- カスタム戦略には、visibility または idle 戦略で `defineLazyHydrationComponent()` を使用する。
- Nuxt の遅延ハイドレーションは単一ファイルコンポーネントで動作する。遅延ハイドレーションされたコンポーネントに新しい props を渡すと、即座にハイドレーションがトリガーされる。
- Nuxt がルートコンポーネントと生成されたペイロードをプリフェッチできるように、内部ナビゲーションには `NuxtLink` を使用する。

## レビューチェックリスト

- 最初の SSR レンダリングとハイドレーション後のクライアントレンダリングが同じマークアップを生成する
- ページデータはトップレベルの `$fetch` ではなく `useFetch` または `useAsyncData` を使用している
- クリティカルでないデータは遅延であり、明示的なローディング UI がある
- ルートルールがページの SEO と鮮度要件に一致している
- 重いインタラクティブアイランドが遅延読み込みまたは遅延ハイドレーションされている
