#!/usr/bin/env node
/**
 * PostToolUse Hook: Prettier で JS/TS ファイルを自動フォーマット
 *
 * Edit ツール使用後に .ts/.tsx/.js/.jsx ファイルを自動的にフォーマットします。
 * Prettier がインストールされていない場合はスキップします。
 */

const { execFileSync } = require('child_process');
const fs = require('fs');

let data = '';

process.stdin.on('data', chunk => {
  data += chunk;
});

process.stdin.on('end', () => {
  const input = JSON.parse(data);
  const filePath = input.tool_input?.file_path;

  if (filePath && fs.existsSync(filePath)) {
    try {
      execFileSync('npx', ['prettier', '--write', filePath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (_e) {
      // Prettier が利用できない場合はスキップ
    }
  }

  console.log(data);
});
