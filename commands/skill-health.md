---
name: skill-health
description: スキルポートフォリオのヘルスダッシュボードをチャートと分析付きで表示
command: true
---

# Skill Health ダッシュボード

成功率のスパークライン、障害パターンのクラスタリング、保留中の修正提案、バージョン履歴を含むスキルポートフォリオの包括的なヘルスダッシュボードを表示します。

## 実装

skill health CLI をダッシュボードモードで実行:

```bash
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(!f.existsSync(p.join(d,q))){try{var b=p.join(d,'plugins','cache','everything-claude-code');for(var o of f.readdirSync(b))for(var v of f.readdirSync(p.join(b,o))){var c=p.join(b,o,v);if(f.existsSync(p.join(c,q))){d=c;break}}}catch(x){}}console.log(d)")}"
node "$ECC_ROOT/scripts/skills-health.js" --dashboard
```

特定のパネルのみ:

```bash
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(!f.existsSync(p.join(d,q))){try{var b=p.join(d,'plugins','cache','everything-claude-code');for(var o of f.readdirSync(b))for(var v of f.readdirSync(p.join(b,o))){var c=p.join(b,o,v);if(f.existsSync(p.join(c,q))){d=c;break}}}catch(x){}}console.log(d)")}"
node "$ECC_ROOT/scripts/skills-health.js" --dashboard --panel failures
```

機械可読出力:

```bash
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(!f.existsSync(p.join(d,q))){try{var b=p.join(d,'plugins','cache','everything-claude-code');for(var o of f.readdirSync(b))for(var v of f.readdirSync(p.join(b,o))){var c=p.join(b,o,v);if(f.existsSync(p.join(c,q))){d=c;break}}}catch(x){}}console.log(d)")}"
node "$ECC_ROOT/scripts/skills-health.js" --dashboard --json
```

## 使用方法

```
/skill-health                    # 完全なダッシュボード表示
/skill-health --panel failures   # 障害クラスタリングパネルのみ
/skill-health --json             # 機械可読 JSON 出力
```

## 実行内容

1. skills-health.js スクリプトを --dashboard フラグで実行
2. 出力をユーザーに表示
3. 低下しているスキルがあればハイライトし /evolve の実行を提案
4. 保留中の修正提案があればレビューを提案

## パネル

- **Success Rate (30d)** -- スキルごとの日次成功率スパークラインチャート
- **Failure Patterns** -- クラスター化された障害理由の水平棒グラフ
- **Pending Amendments** -- レビュー待ちの修正提案
- **Version History** -- スキルごとのバージョンスナップショットのタイムライン
