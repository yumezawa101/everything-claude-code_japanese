---
description: メモリ安全性、モダン C++ イディオム、並行性、セキュリティについての包括的な C++ コードレビュー。cpp-reviewer エージェントを呼び出します。
---

# C++ Code Review

このコマンドは C++ 固有の包括的なコードレビューのために **cpp-reviewer** エージェントを呼び出します。

## このコマンドの機能

1. **C++ 変更の特定**: `git diff` で変更された `.cpp`、`.hpp`、`.cc`、`.h` ファイルを検出
2. **静的解析の実行**: `clang-tidy` と `cppcheck` を実行
3. **メモリ安全性スキャン**: 生の new/delete、バッファオーバーフロー、解放後使用をチェック
4. **並行性レビュー**: スレッドセーフティ、mutex 使用、データ競合を分析
5. **モダン C++ チェック**: コードが C++17/20 の慣習とベストプラクティスに従っていることを確認
6. **レポート生成**: 問題を重大度別に分類

## 使用するタイミング

以下の場合に `/cpp-review` を使用:
- C++ コードを作成または変更した後
- C++ の変更をコミットする前
- C++ コードを含むプルリクエストのレビュー時
- 新しい C++ コードベースへのオンボーディング時
- メモリ安全性の問題をチェックする場合

## レビューカテゴリ

### CRITICAL（必須修正）
- RAII なしの生の `new`/`delete`
- バッファオーバーフローと解放後使用
- 同期化なしのデータ競合
- `system()` によるコマンドインジェクション
- 初期化されていない変数の読み取り
- null ポインタの参照解除

### HIGH（修正推奨）
- Rule of Five 違反
- `std::lock_guard` / `std::scoped_lock` の欠落
- 適切なライフタイム管理なしのデタッチされたスレッド
- `static_cast`/`dynamic_cast` の代わりに C スタイルキャスト
- `const` 正確性の欠如

### MEDIUM（検討）
- 不要なコピー（`const&` の代わりに値渡し）
- 既知サイズのコンテナで `reserve()` の欠落
- ヘッダでの `using namespace std;`
- 重要な戻り値に `[[nodiscard]]` の欠落
- 過度に複雑なテンプレートメタプログラミング

## 実行される自動チェック

```bash
# 静的解析
clang-tidy --checks='*,-llvmlibc-*' src/*.cpp -- -std=c++17

# 追加解析
cppcheck --enable=all --suppress=missingIncludeSystem src/

# 警告付きビルド
cmake --build build -- -Wall -Wextra -Wpedantic
```

## 使用例

```text
User: /cpp-review

Agent:
# C++ コードレビューレポート

## レビューされたファイル
- src/handler/user.cpp (変更)
- src/service/auth.cpp (変更)

## 静的解析結果
✓ clang-tidy: 2件の警告
✓ cppcheck: 問題なし

## 発見された問題

[CRITICAL] メモリリーク
File: src/service/auth.cpp:45
Issue: 対応する `delete` のない生の `new`
```cpp
auto* session = new Session(userId);  // メモリリーク！
cache[userId] = session;
```
Fix: `std::unique_ptr` を使用
```cpp
auto session = std::make_unique<Session>(userId);
cache[userId] = std::move(session);
```

[HIGH] const 参照の欠落
File: src/handler/user.cpp:28
Issue: 大きなオブジェクトを値渡し
```cpp
void processUser(User user) {  // 不要なコピー
```
Fix: const 参照で渡す
```cpp
void processUser(const User& user) {
```

## サマリー
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

推奨: CRITICAL 問題が修正されるまでマージをブロック
```

## 承認基準

| ステータス | 条件 |
|--------|-----------|
| 承認 | CRITICAL または HIGH 問題なし |
| 警告 | MEDIUM 問題のみ（注意してマージ） |
| ブロック | CRITICAL または HIGH 問題が発見された |

## 他のコマンドとの統合

- まず `/cpp-test` を使用してテストが合格することを確認
- `/cpp-build` をビルドエラー発生時に使用
- `/cpp-review` をコミット前に使用
- `/code-review` を C++ 固有でない問題に使用

## 関連

- Agent: `agents/cpp-reviewer.md`
- Skills: `skills/cpp-coding-standards/`, `skills/cpp-testing/`
