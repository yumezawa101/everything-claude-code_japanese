#!/usr/bin/env node
/**
 * PostToolUse Hook: TypeScript 型チェック
 *
 * Edit ツール使用後に .ts/.tsx ファイルの型エラーを検出します。
 * tsconfig.json が見つからない場合はスキップします。
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let data = '';

process.stdin.on('data', chunk => {
  data += chunk;
});

process.stdin.on('end', () => {
  const input = JSON.parse(data);
  const filePath = input.tool_input?.file_path;

  if (filePath && fs.existsSync(filePath)) {
    // tsconfig.json を持つ最も近い親ディレクトリを検索
    let dir = path.dirname(filePath);
    while (dir !== path.dirname(dir) && !fs.existsSync(path.join(dir, 'tsconfig.json'))) {
      dir = path.dirname(dir);
    }

    if (fs.existsSync(path.join(dir, 'tsconfig.json'))) {
      try {
        const result = execSync('npx tsc --noEmit --pretty false 2>&1', {
          cwd: dir,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        const lines = result.split('\n').filter(l => l.includes(filePath)).slice(0, 10);
        if (lines.length) {
          console.error(lines.join('\n'));
        }
      } catch (e) {
        const lines = (e.stdout || '').split('\n').filter(l => l.includes(filePath)).slice(0, 10);
        if (lines.length) {
          console.error(lines.join('\n'));
        }
      }
    }
  }

  console.log(data);
});
