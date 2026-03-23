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
# C++ パターン

> このファイルは [common/patterns.md](../common/patterns.md) を C++ 固有のコンテンツで拡張します。

## RAII（Resource Acquisition Is Initialization）

リソースのライフタイムをオブジェクトのライフタイムに結びつける:

```cpp
class FileHandle {
public:
    explicit FileHandle(const std::string& path) : file_(std::fopen(path.c_str(), "r")) {}
    ~FileHandle() { if (file_) std::fclose(file_); }
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
private:
    std::FILE* file_;
};
```

## 5 の法則 / 0 の法則

- **0 の法則**: カスタムデストラクタ、コピー/ムーブコンストラクタ、代入演算子が不要なクラスを優先
- **5 の法則**: デストラクタ/コピーコンストラクタ/コピー代入/ムーブコンストラクタ/ムーブ代入のいずれかを定義する場合、5 つすべてを定義

## 値セマンティクス

- 小さい/トリビアルな型は値渡し
- 大きい型は `const&` で渡す
- 値で返す（RVO/NRVO に依存）
- シンクパラメータにはムーブセマンティクスを使用

## エラーハンドリング

- 例外的な状況には例外を使用
- 存在しない可能性のある値には `std::optional` を使用
- 想定される失敗には `std::expected`（C++23）または result 型を使用

## リファレンス

包括的な C++ パターンとアンチパターンについては、スキル: `cpp-coding-standards` を参照。
