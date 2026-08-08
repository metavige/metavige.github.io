import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runHugoBuild } from '../src/build.js';

let siteDir: string;

function writePost(slug: string, body: string) {
  const dir = join(siteDir, 'content', 'posts', slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'index.md'),
    `---\ntitle: "t"\ndate: 2026-08-08 10:00:00\nslug: "${slug}"\ntags: []\ncategories: []\n---\n\n${body}\n`,
  );
  return dir;
}

beforeEach(() => {
  siteDir = mkdtempSync(join(tmpdir(), 'blog-publisher-build-'));
  writeFileSync(join(siteDir, 'hugo.toml'), "title = 'test site'\n");
});

afterEach(() => {
  // dangerous-tool-guard：不用遞迴強制刪除，改 mv 到暫存墓地目錄
  renameSync(siteDir, `${siteDir}.done`);
});

// PUB-R-04：bundle 建立後執行本機 hugo build
test('合法內容 → build 成功', () => {
  writePost('good-post', 'plain **markdown** body');
  const result = runHugoBuild({ siteDir });
  assert.equal(result.ok, true, !result.ok ? result.message : '');
});

// EX-D#1（PUB-R-10）：非法 shortcode 使 build 失敗
test('非法 shortcode → E-BUILD-FAILED 附錯誤輸出，檔案保留', () => {
  const dir = writePost('bad-post', '{{< no-such-shortcode >}}');
  const result = runHugoBuild({ siteDir });
  assert.equal(result.ok, false);
  assert.equal(!result.ok && result.code, 'E-BUILD-FAILED');
  assert.ok(!result.ok && /no-such-shortcode|shortcode/i.test(result.message), '錯誤輸出應含 build 失敗原因');
  assert.ok(existsSync(join(dir, 'index.md')), 'bundle 檔案應保留供檢查');
});

// build 不落地 public/（--renderToMemory）
test('build 成功時不在 siteDir 產生 public 目錄', () => {
  writePost('good-post', 'body');
  const result = runHugoBuild({ siteDir });
  assert.equal(result.ok, true);
  assert.ok(!existsSync(join(siteDir, 'public')));
});
