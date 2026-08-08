import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const serverEntry = fileURLToPath(new URL('../src/index.ts', import.meta.url));
const tsxCli = fileURLToPath(
  new URL('../node_modules/tsx/dist/cli.mjs', import.meta.url),
);

async function connect() {
  const client = new Client({ name: 'server-test', version: '0.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [tsxCli, serverEntry],
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

test('publish_post 骨架回傳未實作錯誤', async () => {
  const client = await connect();
  try {
    const result = await client.callTool({
      name: 'publish_post',
      arguments: {
        title: '測試',
        slug: 'test-post',
        content: 'hello',
      },
    });
    assert.equal(result.isError, true);
    const text = result.content?.find((c: { type: string }) => c.type === 'text');
    assert.match((text as { text: string }).text, /E-NOT-IMPLEMENTED/);
  } finally {
    await client.close();
  }
});
