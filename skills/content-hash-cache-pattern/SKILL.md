---
name: content-hash-cache-pattern
description: SHA-256コンテンツハッシュを使用して高コストなファイル処理結果をキャッシュする -- パス非依存、自動無効化、サービス層分離。
origin: ECC
---

# Content-Hashファイルキャッシュパターン

SHA-256コンテンツハッシュをキャッシュキーとして使用し、高コストなファイル処理結果（PDF解析、テキスト抽出、画像分析）をキャッシュする。パスベースのキャッシュと異なり、ファイルの移動/リネームに耐え、コンテンツ変更時に自動無効化される。

## 発動条件

- ファイル処理パイプライン（PDF、画像、テキスト抽出）の構築
- 処理コストが高く同じファイルが繰り返し処理される
- `--cache/--no-cache` CLIオプションが必要
- 既存の純粋関数を変更せずにキャッシュを追加したい

## コアパターン

### 1. コンテンツハッシュベースのキャッシュキー

ファイルの内容（パスではなく）をキャッシュキーとして使用：

```python
import hashlib
from pathlib import Path

_HASH_CHUNK_SIZE = 65536  # 64KB chunks for large files

def compute_file_hash(path: Path) -> str:
    """SHA-256 of file contents (chunked for large files)."""
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(_HASH_CHUNK_SIZE)
            if not chunk:
                break
            sha256.update(chunk)
    return sha256.hexdigest()
```

**なぜコンテンツハッシュか？** ファイルのリネーム/移動 = キャッシュヒット。コンテンツ変更 = 自動無効化。インデックスファイル不要。

### 2. Frozen Dataclassによるキャッシュエントリ

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CacheEntry:
    file_hash: str
    source_path: str
    document: ExtractedDocument  # The cached result
```

### 3. ファイルベースのキャッシュストレージ

各キャッシュエントリは`{hash}.json`として保存 -- ハッシュによるO(1)ルックアップ、インデックスファイル不要。

```python
import json
from typing import Any

def write_cache(cache_dir: Path, entry: CacheEntry) -> None:
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_file = cache_dir / f"{entry.file_hash}.json"
    data = serialize_entry(entry)
    cache_file.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

def read_cache(cache_dir: Path, file_hash: str) -> CacheEntry | None:
    cache_file = cache_dir / f"{file_hash}.json"
    if not cache_file.is_file():
        return None
    try:
        raw = cache_file.read_text(encoding="utf-8")
        data = json.loads(raw)
        return deserialize_entry(data)
    except (json.JSONDecodeError, ValueError, KeyError):
        return None  # Treat corruption as cache miss
```

### 4. サービス層ラッパー（SRP）

処理関数は純粋に保つ。キャッシュは別のサービス層として追加する。

```python
def extract_with_cache(
    file_path: Path,
    *,
    cache_enabled: bool = True,
    cache_dir: Path = Path(".cache"),
) -> ExtractedDocument:
    """Service layer: cache check -> extraction -> cache write."""
    if not cache_enabled:
        return extract_text(file_path)  # Pure function, no cache knowledge

    file_hash = compute_file_hash(file_path)

    # Check cache
    cached = read_cache(cache_dir, file_hash)
    if cached is not None:
        logger.info("Cache hit: %s (hash=%s)", file_path.name, file_hash[:12])
        return cached.document

    # Cache miss -> extract -> store
    logger.info("Cache miss: %s (hash=%s)", file_path.name, file_hash[:12])
    doc = extract_text(file_path)
    entry = CacheEntry(file_hash=file_hash, source_path=str(file_path), document=doc)
    write_cache(cache_dir, entry)
    return doc
```

## 主要な設計判断

| 判断 | 根拠 |
|----------|-----------|
| SHA-256コンテンツハッシュ | パス非依存、コンテンツ変更時に自動無効化 |
| `{hash}.json`ファイル命名 | O(1)ルックアップ、インデックスファイル不要 |
| サービス層ラッパー | SRP：抽出は純粋に保ち、キャッシュは別の関心事 |
| 手動JSONシリアライゼーション | frozen dataclassシリアライゼーションの完全な制御 |
| 破損時は`None`を返す | 優雅なデグラデーション、次回実行時に再処理 |

## ベストプラクティス

- **パスではなくコンテンツをハッシュする** -- パスは変わる、コンテンツのアイデンティティは変わらない
- **大きなファイルのハッシュ時はチャンクする** -- ファイル全体をメモリに読み込むのを避ける
- **処理関数を純粋に保つ** -- キャッシュについて何も知るべきでない
- **キャッシュヒット/ミスをログ** -- デバッグ用に短縮ハッシュ付きで
- **破損を優雅に処理する** -- 無効なキャッシュエントリはミスとして扱い、クラッシュしない
