import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport, getDefaultEnvironment } from '@modelcontextprotocol/client/stdio';

const serverEntry = fileURLToPath(new URL('../src/index.ts', import.meta.url));
const tsxCli = fileURLToPath(
  new URL('../node_modules/tsx/dist/cli.mjs', import.meta.url),
);

async function connect() {
  // 隔離：server 指向暫存目錄，測試絕不觸碰真實 blog repo
  const repoDir = mkdtempSync(join(tmpdir(), 'blog-publisher-server-'));
  mkdirSync(join(repoDir, 'content', 'posts'), { recursive: true });
  const client = new Client({ name: 'server-test', version: '0.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [tsxCli, serverEntry],
    env: { ...getDefaultEnvironment(), BLOG_REPO_DIR: repoDir },
  });
  await client.connect(transport);
  return client;
}

test('stdio server 啟動後 tools/list 含 publish_post', async () => {
  const client = await connect();
  try {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    assert.ok(names.includes('publish_post'), `tools/list 缺 publish_post，實際為 ${names.join(', ')}`);
  } finally {
    await client.close();
  }
});

test('publish_post 經 stdio 呼叫：非法 slug 回 E-SLUG-INVALID', async () => {
  const client = await connect();
  try {
    const result = await client.callTool({
      name: 'publish_post',
      arguments: {
        title: '測試',
        slug: 'Bad_Slug',
        content: 'hello',
      },
    });
    assert.equal(result.isError, true);
    const text = result.content?.find((c: { type: string }) => c.type === 'text');
    assert.match((text as { text: string }).text, /E-SLUG-INVALID/);
  } finally {
    await client.close();
  }
});
