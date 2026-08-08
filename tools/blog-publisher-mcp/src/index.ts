// stdio MCP server entry — stdout 是協定通道，任何 log 必須走 console.error
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';

serveStdio(() => createServer());
