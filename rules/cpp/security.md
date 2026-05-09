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
# C++ セキュリティ

> このファイルは [common/security.md](../common/security.md) を C++ 固有のコンテンツで拡張します。

## メモリ安全性

- 生の `new`/`delete` は使用しない -- スマートポインタを使用
- C スタイルの配列は使用しない -- `std::array` または `std::vector` を使用
- `malloc`/`free` は使用しない -- C++ のアロケーションを使用
- 絶対に必要な場合を除き `reinterpret_cast` を避ける

## バッファオーバーフロー

- `char*` よりも `std::string` を使用
- 安全性が重要な場合は境界チェック付きの `.at()` を使用
- `strcpy`、`strcat`、`sprintf` は使用しない -- `std::string` または `fmt::format` を使用

## 未定義動作

- 変数は常に初期化
- 符号付き整数のオーバーフローを避ける
- null ポインタやダングリングポインタのデリファレンスをしない
- CI でサニタイザを使用:
  ```bash
  cmake -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined" ..
  ```

## 静的解析

- 自動チェックに **clang-tidy** を使用:
  ```bash
  clang-tidy --checks='*' src/*.cpp
  ```
- 追加の解析に **cppcheck** を使用:
  ```bash
  cppcheck --enable=all src/
  ```

## リファレンス

詳細なセキュリティガイドラインについては、スキル: `cpp-coding-standards` を参照。
