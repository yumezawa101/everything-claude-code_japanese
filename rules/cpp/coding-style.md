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
# C++ コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を C++ 固有のコンテンツで拡張します。

## モダン C++（C++17/20/23）

- C スタイルの構文より **モダン C++ の機能** を優先
- 型がコンテキストから明らかな場合は `auto` を使用
- コンパイル時定数には `constexpr` を使用
- 構造化束縛を使用: `auto [key, value] = map_entry;`

## リソース管理

- **あらゆる場所で RAII** -- 手動の `new`/`delete` は使わない
- 排他的所有権には `std::unique_ptr` を使用
- 共有所有権が本当に必要な場合のみ `std::shared_ptr` を使用
- 生の `new` よりも `std::make_unique` / `std::make_shared` を使用

## 命名規則

- 型/クラス: `PascalCase`
- 関数/メソッド: `snake_case` または `camelCase`（プロジェクト規約に従う）
- 定数: `kPascalCase` または `UPPER_SNAKE_CASE`
- 名前空間: `lowercase`
- メンバー変数: `snake_case_`（末尾アンダースコア）または `m_` プレフィックス

## フォーマット

- **clang-format** を使用 -- スタイルに関する議論は不要
- コミット前に `clang-format -i <file>` を実行

## リファレンス

包括的な C++ コーディング標準とガイドラインについては、スキル: `cpp-coding-standards` を参照。
