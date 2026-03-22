---
description: C++ ビルドエラー、CMake の問題、リンカーの問題を段階的に修正します。最小限の外科的修正のために cpp-build-resolver エージェントを呼び出します。
---

# C++ Build and Fix

このコマンドは **cpp-build-resolver** エージェントを呼び出し、最小限の変更で C++ ビルドエラーを段階的に修正します。

## このコマンドの機能

1. **診断の実行**: `cmake --build`、`clang-tidy`、`cppcheck` を実行
2. **エラーの解析**: ファイル別にグループ化し重大度順にソート
3. **段階的修正**: 一度に1つのエラーを修正
4. **各修正の検証**: 各変更後にビルドを再実行
5. **サマリーの報告**: 修正されたものと残っているものを表示

## 使用するタイミング

以下の場合に `/cpp-build` を使用:
- `cmake --build build` がエラーで失敗する場合
- リンカーエラー（未定義参照、多重定義）
- テンプレートインスタンス化の失敗
- インクルード/依存関係の問題
- ビルドを壊す変更をプルした後

## 実行される診断コマンド

```bash
# CMake 設定
cmake -B build -S .

# ビルド
cmake --build build 2>&1 | head -100

# 静的解析（利用可能な場合）
clang-tidy src/*.cpp -- -std=c++17
cppcheck --enable=all src/
```

## セッション例

```text
User: /cpp-build

Agent:
# C++ ビルド解決

## 初期診断

```bash
$ cmake --build build
src/service/user.cpp:25:15: error: use of undeclared identifier 'UserRepository'
src/handler/api.cpp:42:9: error: no matching function for call to 'process'
src/handler/api.cpp:58:1: error: non-void function does not return a value
```

エラー検出: 3件

## 修正 1: 未宣言の識別子

File: src/service/user.cpp:25
Error: use of undeclared identifier 'UserRepository'
Cause: インクルード欠落

```cpp
// インクルードを追加
#include "repository/user_repository.hpp"
```

```bash
$ cmake --build build
# 残り2件のエラー
```

## 修正 2: 一致する関数がない

File: src/handler/api.cpp:42
Error: no matching function for call to 'process'

```cpp
// 変更前
process(params.get("count"));
// 変更後
process(std::stoi(params.get("count")));
```

```bash
$ cmake --build build
# 残り1件のエラー
```

## 修正 3: 戻り値の欠落

File: src/handler/api.cpp:58
Error: non-void function does not return a value

```cpp
std::optional<User> getUser(const std::string& id) {
    if (id.empty()) {
        return std::nullopt;
    }
    auto user = findUser(id);
    // 欠落していた戻り値を追加
    return user;
}
```

```bash
$ cmake --build build
# ビルド成功！
```

## 最終検証

```bash
$ ctest --test-dir build --output-on-failure
Test project build
    1/5 Test #1: unit_tests ........   Passed    0.02 sec
    2/5 Test #2: integration_tests    Passed    0.15 sec
All tests passed.
```

## サマリー

| 指標 | 件数 |
|--------|-------|
| 修正されたビルドエラー | 3 |
| 修正されたリンカーエラー | 0 |
| 変更されたファイル | 2 |
| 残存問題 | 0 |

ビルドステータス: SUCCESS
```

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `undeclared identifier` | `#include` を追加またはタイプミスを修正 |
| `no matching function` | 引数の型を修正またはオーバーロードを追加 |
| `undefined reference` | ライブラリをリンクまたは実装を追加 |
| `multiple definition` | `inline` を使用または .cpp に移動 |
| `incomplete type` | 前方宣言を `#include` に置換 |
| `no member named X` | メンバー名を修正またはインクルードを追加 |
| `cannot convert X to Y` | 適切なキャストを追加 |
| `CMake Error` | CMakeLists.txt の設定を修正 |

## 修正戦略

1. **まずコンパイルエラー** - コードがコンパイルできる必要がある
2. **次にリンカーエラー** - 未定義参照を解決
3. **最後に警告** - `-Wall -Wextra` で修正
4. **一度に1つの修正** - 各変更を検証
5. **最小限の変更** - リファクタリングではなく修正のみ

## 停止条件

以下の場合、エージェントは停止して報告:
- 同じエラーが3回の試行後も持続
- 修正がさらなるエラーを引き起こす
- アーキテクチャの変更が必要
- 外部依存関係が欠落

## 関連コマンド

- `/cpp-test` - ビルド成功後にテストを実行
- `/cpp-review` - コード品質をレビュー
- `/verify` - 完全な検証ループ

## 関連

- Agent: `agents/cpp-build-resolver.md`
- Skill: `skills/cpp-coding-standards/`
