---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
  - "**/*.sln"
  - "**/Directory.Build.props"
  - "**/Directory.Build.targets"
---
# C# Hooks

> このファイルは [common/hooks.md](../common/hooks.md) を C# 固有のコンテンツで拡張します。

## PostToolUse Hooks

`~/.claude/settings.json` で設定:

- **dotnet format**: 編集された C# ファイルを自動フォーマットしアナライザー修正を適用
- **dotnet build**: 編集後にソリューションまたはプロジェクトのコンパイルを検証
- **dotnet test --no-build**: 振る舞いの変更後に最も関連性の高いテストプロジェクトを再実行

## Stop Hooks

- 広範な C# 変更を伴うセッション終了前に最終的な `dotnet build` を実行
- シークレットがコミットされないよう `appsettings*.json` ファイルの変更について警告
