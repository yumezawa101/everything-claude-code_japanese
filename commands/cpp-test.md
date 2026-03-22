---
description: C++ の TDD ワークフローを適用します。GoogleTest テストを最初に記述し、その後実装します。gcov/lcov でカバレッジを確認します。
---

# C++ TDD コマンド

このコマンドは GoogleTest/GoogleMock と CMake/CTest を使用した C++ コードのテスト駆動開発手法を適用します。

## このコマンドの機能

1. **インターフェースの定義**: クラス/関数シグネチャを最初にスキャフォールディング
2. **テストの作成**: 包括的な GoogleTest テストケースを作成（RED）
3. **テストの実行**: テストが正しい理由で失敗することを確認
4. **コードの実装**: テストをパスするための最小限のコードを記述（GREEN）
5. **リファクタリング**: テストをグリーンに保ちながら改善
6. **カバレッジの確認**: 80% 以上のカバレッジを保証

## 使用するタイミング

以下の場合に `/cpp-test` を使用:
- 新しい C++ 関数やクラスの実装時
- 既存コードへのテストカバレッジ追加時
- バグ修正時（失敗するテストを最初に作成）
- 重要なビジネスロジックの構築時
- C++ での TDD ワークフローの学習時

## TDD サイクル

```
RED     → 失敗する GoogleTest テストを作成
GREEN   → テストをパスするための最小限のコードを実装
REFACTOR → コードを改善、テストはグリーンを保持
REPEAT  → 次のテストケースへ
```

## セッション例

````
User: /cpp-test メールアドレスを検証する関数が必要です

Agent:
# TDD セッション: メールバリデーター

## ステップ 1: インターフェースの定義

```cpp
// validator/email.hpp
#pragma once
#include <string>
#include <expected>

enum class EmailError {
    Empty,
    InvalidFormat
};

std::expected<void, EmailError> validate_email(const std::string& email);
```

## ステップ 2: テストの作成（RED）

```cpp
// validator/email_test.cpp
#include <gtest/gtest.h>
#include "email.hpp"

TEST(ValidateEmail, AcceptsSimpleEmail) {
    auto result = validate_email("user@example.com");
    EXPECT_TRUE(result.has_value());
}

TEST(ValidateEmail, AcceptsSubdomain) {
    EXPECT_TRUE(validate_email("user@mail.example.com").has_value());
}

TEST(ValidateEmail, AcceptsPlus) {
    EXPECT_TRUE(validate_email("user+tag@example.com").has_value());
}

TEST(ValidateEmail, RejectsEmpty) {
    auto result = validate_email("");
    ASSERT_FALSE(result.has_value());
    EXPECT_EQ(result.error(), EmailError::Empty);
}

TEST(ValidateEmail, RejectsNoAtSign) {
    EXPECT_FALSE(validate_email("userexample.com").has_value());
}

TEST(ValidateEmail, RejectsNoDomain) {
    EXPECT_FALSE(validate_email("user@").has_value());
}

TEST(ValidateEmail, RejectsNoLocalPart) {
    EXPECT_FALSE(validate_email("@example.com").has_value());
}
```

## ステップ 3: テストの実行 - 失敗を確認

```bash
$ cmake --build build && ctest --test-dir build --output-on-failure

1/1 Test #1: email_validator_test .....***Failed
    --- undefined reference to `validate_email`

FAIL
```

テストが期待通り失敗しました（未実装）。

## ステップ 4: 最小限のコード実装（GREEN）

```cpp
// validator/email.cpp
#include "email.hpp"
#include <regex>

std::expected<void, EmailError> validate_email(const std::string& email) {
    if (email.empty()) {
        return std::unexpected(EmailError::Empty);
    }
    static const std::regex pattern(R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})");
    if (!std::regex_match(email, pattern)) {
        return std::unexpected(EmailError::InvalidFormat);
    }
    return {};
}
```

## ステップ 5: テストの実行 - パスを確認

```bash
$ cmake --build build && ctest --test-dir build --output-on-failure

1/1 Test #1: email_validator_test .....   Passed    0.01 sec

100% tests passed.
```

すべてのテストが合格！

## ステップ 6: カバレッジの確認

```bash
$ cmake -DCMAKE_CXX_FLAGS="--coverage" -B build && cmake --build build
$ ctest --test-dir build
$ lcov --capture --directory build --output-file coverage.info
$ lcov --list coverage.info

validator/email.cpp     | 100%
```

カバレッジ: 100%

## TDD 完了！
````

## テストパターン

### 基本テスト
```cpp
TEST(SuiteName, TestName) {
    EXPECT_EQ(add(2, 3), 5);
    EXPECT_NE(result, nullptr);
    EXPECT_TRUE(is_valid);
    EXPECT_THROW(func(), std::invalid_argument);
}
```

### フィクスチャ
```cpp
class DatabaseTest : public ::testing::Test {
protected:
    void SetUp() override { db_ = create_test_db(); }
    void TearDown() override { db_.reset(); }
    std::unique_ptr<Database> db_;
};

TEST_F(DatabaseTest, InsertsRecord) {
    db_->insert("key", "value");
    EXPECT_EQ(db_->get("key"), "value");
}
```

### パラメータ化テスト
```cpp
class PrimeTest : public ::testing::TestWithParam<std::pair<int, bool>> {};

TEST_P(PrimeTest, ChecksPrimality) {
    auto [input, expected] = GetParam();
    EXPECT_EQ(is_prime(input), expected);
}

INSTANTIATE_TEST_SUITE_P(Primes, PrimeTest, ::testing::Values(
    std::make_pair(2, true),
    std::make_pair(4, false),
    std::make_pair(7, true)
));
```

## カバレッジコマンド

```bash
# カバレッジ付きビルド
cmake -DCMAKE_CXX_FLAGS="--coverage" -DCMAKE_EXE_LINKER_FLAGS="--coverage" -B build

# テスト実行
cmake --build build && ctest --test-dir build

# カバレッジレポート生成
lcov --capture --directory build --output-file coverage.info
lcov --remove coverage.info '/usr/*' --output-file coverage.info
genhtml coverage.info --output-directory coverage_html
```

## カバレッジ目標

| コードタイプ | 目標 |
|-----------|--------|
| 重要なビジネスロジック | 100% |
| パブリック API | 90%+ |
| 一般的なコード | 80%+ |
| 生成されたコード | 除外 |

## TDD ベストプラクティス

**推奨事項:**
- 実装前にテストを最初に書く
- 各変更後にテストを実行
- 適切な場合は `EXPECT_*`（続行）を `ASSERT_*`（停止）より優先
- 実装の詳細ではなく動作をテスト
- エッジケースを含める（空、null、最大値、境界条件）

**避けるべき事項:**
- テストの前に実装を書く
- RED フェーズをスキップ
- プライベートメソッドを直接テスト（パブリック API 経由でテスト）
- テストで `sleep` を使用
- 不安定なテストを無視

## 関連コマンド

- `/cpp-build` - ビルドエラーの修正
- `/cpp-review` - 実装後のコードレビュー
- `/verify` - 完全な検証ループ

## 関連

- Skill: `skills/cpp-testing/`
- Skill: `skills/tdd-workflow/`
