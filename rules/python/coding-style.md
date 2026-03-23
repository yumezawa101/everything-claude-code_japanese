---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Python 固有のコンテンツで拡張します。

## 標準

- **PEP 8** 規約に従う
- すべての関数シグネチャに **型アノテーション** を使用

## イミュータビリティ

イミュータブルなデータ構造を優先:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str

from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float
```

## フォーマット

- **black** でコードフォーマット
- **isort** でインポートソート
- **ruff** でリント

## リファレンス

包括的な Python イディオムとパターンについては、スキル: `python-patterns` を参照。
