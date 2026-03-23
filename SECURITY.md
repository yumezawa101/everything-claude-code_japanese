# セキュリティポリシー

## サポート対象バージョン

| バージョン | サポート状況        |
| ---------- | ------------------ |
| 1.9.x      | :white_check_mark: |
| 1.8.x      | :white_check_mark: |
| < 1.8      | :x:                |

## 脆弱性の報告

ECC にセキュリティ上の脆弱性を発見した場合は、責任ある方法で報告してください。

**セキュリティ脆弱性について、公開の GitHub Issue を作成しないでください。**

代わりに、以下の情報を **security@ecc.tools** にメールしてください:

- 脆弱性の説明
- 再現手順
- 影響を受けるバージョン
- 想定される影響の評価

対応の目安:

- 48時間以内に **受領確認**
- 7日以内に **状況の更新**
- 重大な問題については30日以内に **修正または緩和策**

脆弱性が承認された場合:

- リリースノートにクレジットを記載します（匿名を希望される場合を除く）
- 迅速に問題を修正します
- 開示のタイミングについてご相談します

脆弱性が却下された場合は、その理由を説明し、他の報告先が適切かどうかについてガイダンスを提供します。

## 対象範囲

このポリシーの対象:

- ECC プラグインおよびこのリポジトリ内のすべてのスクリプト
- マシン上で実行される hook スクリプト
- install/uninstall/repair ライフサイクルスクリプト
- ECC に同梱される MCP 設定
- AgentShield セキュリティスキャナー ([github.com/affaan-m/agentshield](https://github.com/affaan-m/agentshield))

## セキュリティリソース

- **AgentShield**: agent 設定の脆弱性をスキャン -- `npx ecc-agentshield scan`
- **セキュリティガイド**: [The Shorthand Guide to Everything Agentic Security](./the-security-guide.md)
- **OWASP MCP Top 10**: [owasp.org/www-project-mcp-top-10](https://owasp.org/www-project-mcp-top-10/)
- **OWASP Agentic Applications Top 10**: [genai.owasp.org](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
