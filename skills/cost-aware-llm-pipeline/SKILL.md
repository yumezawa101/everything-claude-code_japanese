---
name: cost-aware-llm-pipeline
description: LLM API利用のコスト最適化パターン -- タスク複雑度によるモデルルーティング、予算追跡、リトライロジック、プロンプトキャッシング。
origin: ECC
---

# コスト考慮LLMパイプライン

品質を維持しながらLLM APIコストを制御するためのパターン。モデルルーティング、予算追跡、リトライロジック、プロンプトキャッシングをコンポーザブルなパイプラインに組み合わせる。

## 発動条件

- LLM API（Claude、GPTなど）を呼び出すアプリケーションの構築
- 複雑さが異なるアイテムのバッチ処理
- API支出の予算内に収める必要がある
- 複雑なタスクの品質を犠牲にせずにコストを最適化

## コアコンセプト

### 1. タスク複雑度によるモデルルーティング

シンプルなタスクには安価なモデルを自動選択し、複雑なタスクには高価なモデルを予約する。

```python
MODEL_SONNET = "claude-sonnet-4-6"
MODEL_HAIKU = "claude-haiku-4-5-20251001"

_SONNET_TEXT_THRESHOLD = 10_000  # chars
_SONNET_ITEM_THRESHOLD = 30     # items

def select_model(
    text_length: int,
    item_count: int,
    force_model: str | None = None,
) -> str:
    """Select model based on task complexity."""
    if force_model is not None:
        return force_model
    if text_length >= _SONNET_TEXT_THRESHOLD or item_count >= _SONNET_ITEM_THRESHOLD:
        return MODEL_SONNET  # Complex task
    return MODEL_HAIKU  # Simple task (3-4x cheaper)
```

### 2. イミュータブルなコスト追跡

frozen dataclassで累積支出を追跡。各API呼び出しは新しいトラッカーを返す -- 状態を変更しない。

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CostRecord:
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float

@dataclass(frozen=True, slots=True)
class CostTracker:
    budget_limit: float = 1.00
    records: tuple[CostRecord, ...] = ()

    def add(self, record: CostRecord) -> "CostTracker":
        """Return new tracker with added record (never mutates self)."""
        return CostTracker(
            budget_limit=self.budget_limit,
            records=(*self.records, record),
        )

    @property
    def total_cost(self) -> float:
        return sum(r.cost_usd for r in self.records)

    @property
    def over_budget(self) -> bool:
        return self.total_cost > self.budget_limit
```

### 3. 狭いリトライロジック

一時的エラーのみリトライ。認証やバッドリクエストエラーでは即座に失敗。

```python
from anthropic import (
    APIConnectionError,
    InternalServerError,
    RateLimitError,
)

_RETRYABLE_ERRORS = (APIConnectionError, RateLimitError, InternalServerError)
_MAX_RETRIES = 3

def call_with_retry(func, *, max_retries: int = _MAX_RETRIES):
    """Retry only on transient errors, fail fast on others."""
    for attempt in range(max_retries):
        try:
            return func()
        except _RETRYABLE_ERRORS:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
    # AuthenticationError, BadRequestError etc. → raise immediately
```

### 4. プロンプトキャッシング

リクエストごとに再送信しないよう長いシステムプロンプトをキャッシュ。

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},  # Cache this
            },
            {
                "type": "text",
                "text": user_input,  # Variable part
            },
        ],
    }
]
```

## 価格リファレンス（2025-2026）

| モデル | 入力 ($/1M tokens) | 出力 ($/1M tokens) | 相対コスト |
|-------|---------------------|----------------------|---------------|
| Haiku 4.5 | $0.80 | $4.00 | 1x |
| Sonnet 4.6 | $3.00 | $15.00 | 約4x |
| Opus 4.5 | $15.00 | $75.00 | 約19x |

## ベストプラクティス

- **最も安価なモデルから始める** -- 複雑さの閾値を満たした場合にのみ高価なモデルにルーティング
- **バッチ処理前に明示的な予算制限を設定** -- 過剰支出より早期に失敗
- **モデル選択決定をログ** -- 実データに基づいて閾値を調整可能にする
- **1024トークンを超えるシステムプロンプトにはプロンプトキャッシングを使用** -- コストとレイテンシの両方を節約
- **認証や検証エラーではリトライしない** -- 一時的な障害（ネットワーク、レート制限、サーバーエラー）のみ
