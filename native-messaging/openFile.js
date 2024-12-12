#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 固定项目根目录
const PROJECT_ROOT = path.join(require('os').homedir(), 'Desktop', 'project');

// 设置标准输入输出
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 递归搜索以 srcid 为名称的文件夹
function findSrcidFolder(dir, srcid) {
  if (!fs.existsSync(dir)) {
    console.error(`项目目录不存在: ${dir}`);
    return null;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === srcid) {
        const indexSanPath = path.join(fullPath, 'index.san');
        if (fs.existsSync(indexSanPath)) {
          return indexSanPath; // 找到目标文件
        }
      }

      // 继续递归子目录
      const found = findSrcidFolder(fullPath, srcid);
      if (found) return found;
    }
  }
  return null; // 未找到
}

// 监听消息
rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    if (message.srcid) {
      const filePath = findSrcidFolder(PROJECT_ROOT, message.srcid);

      if (filePath) {
        // 调用 VSCode 打开文件
        exec(`code ${filePath}`, (error) => {
          if (error) {
            console.error(`Error opening file: ${error.message}`);
            process.stdout.write(JSON.stringify({ success: false, error: error.message }) + '\n');
          } else {
            process.stdout.write(JSON.stringify({ success: true, path: filePath }) + '\n');
          }
        });
      } else {
        // 文件未找到
        console.error('File not found');
        process.stdout.write(JSON.stringify({ success: false, error: 'File not found' }) + '\n');
      }
    }
  } catch (e) {
    console.error('Failed to parse message:', e.message);
    process.stdout.write(JSON.stringify({ success: false, error: 'Invalid message format' }) + '\n');
  }
});



//echo '{"srcid":"sign_fortune"}' | node /Users/baozhangjie/Desktop/cb-wise-debugger/native-messaging/openFile.js
//echo '{"srcid":"sign_fortune"}' | /Users/baozhangjie/Desktop/cb-wise-debugger/native-messaging/openFile.js
