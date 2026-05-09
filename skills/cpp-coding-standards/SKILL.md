---
name: cpp-coding-standards
description: C++ Core Guidelines（isocpp.github.io）に基づくC++コーディング標準。モダンで安全かつイディオマティックなプラクティスを強制するためにC++コードの記述、レビュー、リファクタリング時に使用。
origin: ECC
---

# C++コーディング標準（C++ Core Guidelines）

[C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)に基づくモダンC++（C++17/20/23）の包括的なコーディング標準。型安全性、リソース安全性、イミュータビリティ、明確性を強制する。

## 使用タイミング

- 新しいC++コード（クラス、関数、テンプレート）の記述
- 既存のC++コードのレビューまたはリファクタリング
- C++プロジェクトでのアーキテクチャ決定
- C++コードベース全体で一貫したスタイルの強制
- 言語機能間の選択（`enum` vs `enum class`、生ポインタ vs スマートポインタなど）

### 使用しない場合

- 非C++プロジェクト
- モダンC++機能を採用できないレガシーCコードベース
- 特定のガイドラインがハードウェア制約と衝突する組込み/ベアメタルコンテキスト（選択的に適応）

## 横断的原則

1. **あらゆる場所にRAII**（P.8, R.1, E.6, CP.20）：リソースのライフタイムをオブジェクトのライフタイムにバインド
2. **デフォルトでイミュータビリティ**（P.10, Con.1-5, ES.25）：`const`/`constexpr`から始める。ミュータビリティは例外
3. **型安全性**（P.4, I.4, ES.46-49, Enum.3）：コンパイル時にエラーを防止するために型システムを使用
4. **意図の表現**（P.3, F.1, NL.1-2, T.10）：名前、型、コンセプトが目的を伝えるべき
5. **複雑さの最小化**（F.2-3, ES.5, Per.4-5）：シンプルなコードは正しいコード
6. **ポインタセマンティクスよりバリューセマンティクス**（C.10, R.3-5, F.20, CP.31）：値による返却とスコープ付きオブジェクトを優先

## 哲学とインターフェース（P.*, I.*）

- P.1: アイデアを直接コードで表現する
- P.8: リソースをリークしない
- P.10: ミュータブルデータよりイミュータブルデータを優先
- I.4: インターフェースを正確かつ強い型付けにする
- I.11: 生ポインタや参照で所有権を転送しない

## 関数（F.*）

- F.2: 関数は1つの論理操作を実行すべき
- F.4: コンパイル時に評価可能なら`constexpr`宣言
- F.16: "in"パラメータは安価にコピーできる型を値で、それ以外を`const&`で渡す
- F.20: "out"値には出力パラメータよりも返り値を優先
- F.43: ローカルオブジェクトへのポインタや参照を返さない

## クラスとクラス階層（C.*）

- C.20: デフォルト操作の定義を避けられるなら避ける（Rule of Zero）
- C.21: copy/move/destructorのいずれかを定義/削除するなら全て扱う（Rule of Five）
- C.35: 基底クラスのデストラクタはpublic virtualまたはprotected non-virtual
- C.46: 単一引数コンストラクタを`explicit`宣言
- C.128: 仮想関数は`virtual`、`override`、`final`のいずれか1つのみを指定

## リソース管理（R.*）

- R.1: RAIIを使用してリソースを自動管理
- R.3: 生ポインタ（`T*`）は非所有
- R.11: 明示的な`new`と`delete`の呼び出しを避ける
- R.20: 所有権の表現に`unique_ptr`または`shared_ptr`を使用
- R.21: 所有権を共有しない限り`shared_ptr`より`unique_ptr`を優先

```cpp
auto widget = std::make_unique<Widget>("config");  // unique ownership
auto cache  = std::make_shared<Cache>(1024);        // shared ownership

// R.3: Raw pointer = non-owning observer
void render(const Widget* w) {  // does NOT own w
    if (w) w->draw();
}
```

## 式と文（ES.*）

- ES.20: 常にオブジェクトを初期化
- ES.25: 変更予定がなければオブジェクトを`const`または`constexpr`で宣言
- ES.45: マジック定数を避け、シンボリック定数を使用
- ES.47: `0`や`NULL`ではなく`nullptr`を使用
- ES.48: キャストを避ける
- ES.50: `const`をキャストで除去しない

## エラーハンドリング（E.*）

- E.6: リークを防止するためにRAIIを使用
- E.14: 目的に設計されたユーザー定義型を例外として使用
- E.15: 値でスローし、参照でキャッチ
- E.16: デストラクタ、デアロケーション、スワップは決して失敗してはならない

```cpp
class AppError : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;
};

class NetworkError : public AppError {
public:
    NetworkError(const std::string& msg, int code)
        : AppError(msg), status_code(code) {}
    int status_code;
};
```

## 定数とイミュータビリティ（Con.*）

- Con.1: デフォルトでオブジェクトをイミュータブルにする
- Con.2: デフォルトでメンバ関数を`const`にする
- Con.3: デフォルトでポインタと参照を`const`で渡す
- Con.5: コンパイル時に計算可能な値には`constexpr`を使用

## 並行性と並列性（CP.*）

- CP.2: データ競合を避ける
- CP.20: RAIIを使用し、素の`lock()`/`unlock()`を使わない
- CP.21: 複数のミューテックスを取得するには`std::scoped_lock`を使用
- CP.44: `lock_guard`と`unique_lock`に名前を付ける

```cpp
void transfer(Account& from, Account& to, double amount) {
    std::scoped_lock lock(from.mutex_, to.mutex_);
    from.balance_ -= amount;
    to.balance_ += amount;
}
```

## テンプレートとジェネリックプログラミング（T.*）

- T.10: すべてのテンプレート引数にコンセプトを指定
- T.11: 可能な限り標準コンセプトを使用
- T.13: シンプルなコンセプトにはショートハンド記法を優先

```cpp
#include <concepts>

template<std::integral T>
T gcd(T a, T b) {
    while (b != 0) {
        a = std::exchange(b, a % b);
    }
    return a;
}
```

## 標準ライブラリ（SL.*）

- SL.con.1: C配列より`std::array`または`std::vector`を優先
- SL.str.1: 文字列の所有には`std::string`
- SL.str.2: 文字列の参照には`std::string_view`
- SL.io.50: `endl`を避ける（`'\n'`を使用 -- `endl`はflushを強制）

## 列挙型（Enum.*）

- Enum.3: 素の`enum`より`enum class`を優先
- Enum.5: 列挙子にALL_CAPSを使わない

```cpp
enum class Color { red, green, blue };
enum class LogLevel { debug, info, warning, error };
```

## クイックリファレンスチェックリスト

C++作業を完了とする前に：

- [ ] 生`new`/`delete`なし -- スマートポインタまたはRAIIを使用（R.11）
- [ ] オブジェクトは宣言時に初期化（ES.20）
- [ ] 変数はデフォルトで`const`/`constexpr`（Con.1, ES.25）
- [ ] `enum class`を使用（Enum.3）
- [ ] `0`/`NULL`の代わりに`nullptr`（ES.47）
- [ ] C-styleキャストなし（ES.48）
- [ ] 単一引数コンストラクタは`explicit`（C.46）
- [ ] Rule of ZeroまたはRule of Fiveを適用（C.20, C.21）
- [ ] テンプレートはコンセプトで制約（T.10）
- [ ] ヘッダのグローバルスコープで`using namespace`なし（SF.7）
- [ ] ロックはRAII（`scoped_lock`/`lock_guard`）を使用（CP.20）
- [ ] `std::endl`の代わりに`'\n'`（SL.io.50）
