# スタイルプリセットリファレンス

`frontend-slides`のキュレートされたビジュアルスタイル。

このファイルの用途：
- 必須のビューポートフィッティングCSSベース
- プリセット選択とムードマッピング
- CSSの落とし穴と検証ルール

抽象的な図形のみ。ユーザーが明示的に要求しない限りイラストを避ける。

## ビューポートフィットは交渉不可

すべてのスライドは1つのビューポートに完全に収まる必要がある。

### ゴールデンルール

```text
Each slide = exactly one viewport height.
Too much content = split into more slides.
Never scroll inside a slide.
```

### 密度制限

| スライドタイプ | 最大コンテンツ |
|------------|-----------------|
| タイトルスライド | 見出し1つ + サブタイトル1つ + オプションのタグライン |
| コンテンツスライド | 見出し1つ + 箇条書き4-6個または段落2つ |
| 機能グリッド | カード最大6つ |
| コードスライド | 最大8-10行 |
| 引用スライド | 引用1つ + 帰属 |
| 画像スライド | 画像1つ、理想的には60vh以下 |

## 必須ベースCSS

このブロックを生成されるすべてのプレゼンテーションにコピーし、その上にテーマを適用する。

```css
/* ===========================================
   VIEWPORT FITTING: MANDATORY BASE STYLES
   =========================================== */

html, body {
    height: 100%;
    overflow-x: hidden;
}

html {
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
}

.slide {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    position: relative;
}

.slide-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: 100%;
    overflow: hidden;
    padding: var(--slide-padding);
}

:root {
    --title-size: clamp(1.5rem, 5vw, 4rem);
    --h2-size: clamp(1.25rem, 3.5vw, 2.5rem);
    --h3-size: clamp(1rem, 2.5vw, 1.75rem);
    --body-size: clamp(0.75rem, 1.5vw, 1.125rem);
    --small-size: clamp(0.65rem, 1vw, 0.875rem);

    --slide-padding: clamp(1rem, 4vw, 4rem);
    --content-gap: clamp(0.5rem, 2vw, 2rem);
    --element-gap: clamp(0.25rem, 1vw, 1rem);
}

.card, .container, .content-box {
    max-width: min(90vw, 1000px);
    max-height: min(80vh, 700px);
}

.feature-list, .bullet-list {
    gap: clamp(0.4rem, 1vh, 1rem);
}

.feature-list li, .bullet-list li {
    font-size: var(--body-size);
    line-height: 1.4;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
    gap: clamp(0.5rem, 1.5vw, 1rem);
}

img, .image-container {
    max-width: 100%;
    max-height: min(50vh, 400px);
    object-fit: contain;
}

@media (max-height: 700px) {
    :root {
        --slide-padding: clamp(0.75rem, 3vw, 2rem);
        --content-gap: clamp(0.4rem, 1.5vw, 1rem);
        --title-size: clamp(1.25rem, 4.5vw, 2.5rem);
        --h2-size: clamp(1rem, 3vw, 1.75rem);
    }
}

@media (max-height: 600px) {
    :root {
        --slide-padding: clamp(0.5rem, 2.5vw, 1.5rem);
        --content-gap: clamp(0.3rem, 1vw, 0.75rem);
        --title-size: clamp(1.1rem, 4vw, 2rem);
        --body-size: clamp(0.7rem, 1.2vw, 0.95rem);
    }

    .nav-dots, .keyboard-hint, .decorative {
        display: none;
    }
}

@media (max-height: 500px) {
    :root {
        --slide-padding: clamp(0.4rem, 2vw, 1rem);
        --title-size: clamp(1rem, 3.5vw, 1.5rem);
        --h2-size: clamp(0.9rem, 2.5vw, 1.25rem);
        --body-size: clamp(0.65rem, 1vw, 0.85rem);
    }
}

@media (max-width: 600px) {
    :root {
        --title-size: clamp(1.25rem, 7vw, 2.5rem);
    }

    .grid {
        grid-template-columns: 1fr;
    }
}

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.2s !important;
    }

    html {
        scroll-behavior: auto;
    }
}
```

## ビューポートチェックリスト

- すべての`.slide`に`height: 100vh`、`height: 100dvh`、`overflow: hidden`がある
- すべてのタイポグラフィが`clamp()`を使用
- すべてのスペーシングが`clamp()`またはビューポート単位を使用
- 画像に`max-height`制約がある
- グリッドが`auto-fit` + `minmax()`で適応する
- `700px`、`600px`、`500px`の短い高さのブレークポイントが存在する
- 窮屈に感じる場合はスライドを分割する

## ムードからプリセットへのマッピング

| ムード | 適切なプリセット |
|------|--------------|
| 印象的 / 自信 | Bold Signal, Electric Studio, Dark Botanical |
| 興奮 / エネルギッシュ | Creative Voltage, Neon Cyber, Split Pastel |
| 落ち着き / 集中 | Notebook Tabs, Paper & Ink, Swiss Modern |
| インスピレーション / 感動 | Dark Botanical, Vintage Editorial, Pastel Geometry |

## プリセットカタログ

### 1. Bold Signal
- 雰囲気：自信、ハイインパクト、キーノート向け
- 最適：ピッチデッキ、ローンチ、ステートメント
- フォント：Archivo Black + Space Grotesk
- パレット：チャコールベース、ホットオレンジのフォーカルカード、クリスプホワイトテキスト

### 2. Electric Studio
- 雰囲気：クリーン、ボールド、エージェンシー品質
- 最適：クライアントプレゼンテーション、戦略レビュー
- フォント：Manropeのみ
- パレット：黒、白、飽和コバルトアクセント

### 3. Creative Voltage
- 雰囲気：エネルギッシュ、レトロモダン、遊び心のある自信
- 最適：クリエイティブスタジオ、ブランドワーク、プロダクトストーリーテリング
- フォント：Syne + Space Mono

### 4. Dark Botanical
- 雰囲気：エレガント、プレミアム、雰囲気のある
- 最適：高級ブランド、思慮深いナラティブ
- フォント：Cormorant + IBM Plex Sans

### 5. Notebook Tabs
- 雰囲気：エディトリアル、整理された、触感的
- 最適：レポート、レビュー、構造化ストーリーテリング
- フォント：Bodoni Moda + DM Sans

### 6. Pastel Geometry
- 雰囲気：親しみやすい、モダン、フレンドリー
- 最適：プロダクト概要、オンボーディング
- フォント：Plus Jakarta Sansのみ

### 7. Split Pastel
- 雰囲気：遊び心、モダン、クリエイティブ
- 最適：エージェンシーイントロ、ワークショップ
- フォント：Outfitのみ

### 8. Vintage Editorial
- 雰囲気：ウィッティ、個性駆動、雑誌インスパイア
- 最適：パーソナルブランド、意見のあるトーク
- フォント：Fraunces + Work Sans

### 9. Neon Cyber
- 雰囲気：フューチャリスティック、テクノロジー、キネティック
- 最適：AI、インフラ、開発ツール
- フォント：Clash Display + Satoshi

### 10. Terminal Green
- 雰囲気：開発者向け、ハッカークリーン
- 最適：API、CLIツール、エンジニアリングデモ
- フォント：JetBrains Monoのみ

### 11. Swiss Modern
- 雰囲気：ミニマル、精密、データフォワード
- 最適：企業、プロダクト戦略、アナリティクス
- フォント：Archivo + Nunito

### 12. Paper & Ink
- 雰囲気：文学的、思慮深い、ストーリー駆動
- 最適：エッセイ、キーノートナラティブ
- フォント：Cormorant Garamond + Source Serif 4

## ダイレクト選択プロンプト

ユーザーが既に望むスタイルを知っている場合、プレビュー生成を強制せずに上記のプリセット名から直接選択させる。

## アニメーションフィールマッピング

| フィーリング | モーション方向 |
|---------|------------------|
| ドラマティック / シネマティック | ゆっくりフェード、パララックス、大きなスケールイン |
| テクノロジー / フューチャリスティック | グロー、パーティクル、グリッドモーション、スクランブルテキスト |
| 遊び心 / フレンドリー | スプリングイージング、丸い形状、フローティングモーション |
| プロフェッショナル / コーポレート | 控えめな200-300msトランジション、クリーンスライド |
| 落ち着き / ミニマル | 非常に抑制された動き、ホワイトスペースファースト |
| エディトリアル / マガジン | 強い階層、ずらしたテキストと画像の相互作用 |

## CSS落とし穴：関数の否定

以下を書かない：

```css
right: -clamp(28px, 3.5vw, 44px);
margin-left: -min(10vw, 100px);
```

ブラウザはこれらを無視する。

代わりに常にこう書く：

```css
right: calc(-1 * clamp(28px, 3.5vw, 44px));
margin-left: calc(-1 * min(10vw, 100px));
```

## 検証サイズ

最低限以下でテスト：
- デスクトップ：`1920x1080`、`1440x900`、`1280x720`
- タブレット：`1024x768`、`768x1024`
- モバイル：`375x667`、`414x896`
- 横向きスマートフォン：`667x375`、`896x414`

## アンチパターン

使用しない：
- パープル・オン・ホワイトのスタートアップテンプレート
- ユーザーが明示的にユーティリタリアンな中立性を望まない限り、Inter / Roboto / Arialをビジュアルボイスとして
- 箇条書きの壁、小さなタイプ、スクロールが必要なコードブロック
- 抽象的なジオメトリの方が良い場合の装飾的なイラスト
