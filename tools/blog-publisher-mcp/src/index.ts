// stdio MCP server entry — stdout 是協定通道，任何 log 必須走 console.error
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';

// .mcp.json 以 repo 根目錄為 cwd 啟動；可用 BLOG_REPO_DIR 覆寫（測試用）
serveStdio(() => createServer({ repoDir: process.env.BLOG_REPO_DIR ?? process.cwd() }));
