---
paths:
  - "**/*.cpp"
  - "**/*.hpp"
  - "**/*.cc"
  - "**/*.hh"
  - "**/*.cxx"
  - "**/*.h"
  - "**/CMakeLists.txt"
---
# C++ Hooks

> このファイルは [common/hooks.md](../common/hooks.md) を C++ 固有のコンテンツで拡張します。

## ビルド Hooks

C++ の変更をコミットする前にこれらのチェックを実行:

```bash
# フォーマットチェック
clang-format --dry-run --Werror src/*.cpp src/*.hpp

# 静的解析
clang-tidy src/*.cpp -- -std=c++17

# ビルド
cmake --build build

# テスト
ctest --test-dir build --output-on-failure
```

## 推奨 CI パイプライン

1. **clang-format** -- フォーマットチェック
2. **clang-tidy** -- 静的解析
3. **cppcheck** -- 追加の解析
4. **cmake build** -- コンパイル
5. **ctest** -- サニタイザ付きテスト実行
