### プラグインマニフェストの注意点

`.claude-plugin/plugin.json` を編集する場合、Claude プラグインバリデータが**文書化されていないが厳格な制約**を強制しており、曖昧なエラー（例: `agents: Invalid input`）でインストールが失敗する可能性があることに注意してください。特に、コンポーネントフィールドは配列でなければならず、`agents` はディレクトリではなく明示的なファイルパスを使用する必要があり、信頼性の高いバリデーションとインストールには `version` フィールドが必須です。

これらの制約は公開されている例からは明らかではなく、過去に何度もインストール失敗の原因となっています。詳細は `.claude-plugin/PLUGIN_SCHEMA_NOTES.md` に記載されていますので、プラグインマニフェストを変更する前に必ず確認してください。

### カスタムエンドポイントとゲートウェイ

ECC は Claude Code のトランスポート設定を上書きしません。Claude Code が公式の LLM ゲートウェイまたは互換性のあるカスタムエンドポイント経由で動作するよう設定されている場合、hooks、コマンド、スキルは CLI の起動成功後にローカルで実行されるため、プラグインは引き続き動作します。

トランスポートの選択には Claude Code 自体の環境設定を使用してください。例:

```bash
export ANTHROPIC_BASE_URL=https://your-gateway.example.com
export ANTHROPIC_AUTH_TOKEN=your-token
claude
```
