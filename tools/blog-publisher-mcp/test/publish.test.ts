import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, renameSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createBundle, type PublishParams } from '../src/publish.js';

let workDir: string;
let postsDir: string;
let assetsDir: string;

const NOW = new Date(2026, 7, 8, 14, 30, 5); // 2026-08-08 14:30:05 本機時間

function params(overrides: Partial<PublishParams> = {}): PublishParams {
  return {
    title: '測試文',
    slug: 'test-post',
    content: 'Hello **world**\n',
    tags: ['AI'],
    categories: ['思考'],
    assets: [],
    ...overrides,
  };
}

beforeEach(() => {
  workDir = mkdtempSync(join(tmpdir(), 'blog-publisher-test-'));
  postsDir = join(workDir, 'content', 'posts');
  assetsDir = join(workDir, 'assets');
  mkdirSync(postsDir, { recursive: true });
  mkdirSync(assetsDir, { recursive: true });
});

afterEach(() => {
  // dangerous-tool-guard：不用遞迴強制刪除，改 mv 到暫存墓地目錄
  renameSync(workDir, `${workDir}.done`);
});

// EX-A#1 happy path（PUB-R-02）
test('合法參數建立 page bundle，frontmatter 五欄齊備', () => {
  const result = createBundle(params(), { postsDir, now: NOW });
  assert.equal(result.ok, true);
  const indexPath = join(postsDir, 'test-post', 'index.md');
  assert.ok(existsSync(indexPath));
  const text = readFileSync(indexPath, 'utf8');
  assert.match(text, /^---\n/);
  assert.match(text, /title: "測試文"\n/);
  assert.match(text, /date: 2026-08-08 14:30:05\n/);
  assert.match(text, /slug: "test-post"\n/);
  assert.match(text, /tags:\n- "AI"\n/);
  assert.match(text, /categories:\n- "思考"\n/);
  assert.match(text, /\n---\n\nHello \*\*world\*\*\n$/);
});

// EX-A#2 空清單合法（邊界）
test('tags/categories 空清單 → frontmatter 為空清單', () => {
  const result = createBundle(params({ tags: [], categories: [] }), { postsDir, now: NOW });
  assert.equal(result.ok, true);
  const text = readFileSync(join(postsDir, 'test-post', 'index.md'), 'utf8');
  assert.match(text, /tags: \[\]\n/);
  assert.match(text, /categories: \[\]\n/);
});

// EX-B#1 assets 複製進 bundle（PUB-R-03）
test('assets 存在 → 複製進 bundle', () => {
  const asset = join(assetsDir, 'cover.png');
  writeFileSync(asset, 'fake-png-bytes');
  const result = createBundle(params({ assets: [asset] }), { postsDir, now: NOW });
  assert.equal(result.ok, true);
  const copied = join(postsDir, 'test-post', 'cover.png');
  assert.ok(existsSync(copied));
  assert.equal(readFileSync(copied, 'utf8'), 'fake-png-bytes');
});

// EX-B#2 asset 不存在 → E-ASSET-MISSING、零建檔（PUB-R-09）
test('asset 不存在 → E-ASSET-MISSING 且不建立任何檔案', () => {
  const missing = join(assetsDir, 'missing.png');
  const result = createBundle(params({ assets: [missing] }), { postsDir, now: NOW });
  assert.equal(result.ok, false);
  assert.equal(!result.ok && result.code, 'E-ASSET-MISSING');
  assert.ok(!result.ok && result.message.includes(missing));
  assert.deepEqual(readdirSync(postsDir), []);
});

// EX-C#1 slug 含大寫與底線（PUB-R-07）
test('slug "Test_Post" → E-SLUG-INVALID 且不建立任何檔案', () => {
  const result = createBundle(params({ slug: 'Test_Post' }), { postsDir, now: NOW });
  assert.equal(!result.ok && result.code, 'E-SLUG-INVALID');
  assert.deepEqual(readdirSync(postsDir), []);
});

// EX-C#2 slug 尾端連字號（邊界）
test('slug "test-post-" → E-SLUG-INVALID', () => {
  const result = createBundle(params({ slug: 'test-post-' }), { postsDir, now: NOW });
  assert.equal(!result.ok && result.code, 'E-SLUG-INVALID');
  assert.deepEqual(readdirSync(postsDir), []);
});

// EX-C#3 slug 已存在（PUB-R-08）
test('slug 已存在 → E-SLUG-EXISTS 且既有檔案未變', () => {
  const existingDir = join(postsDir, 'test-post');
  mkdirSync(existingDir);
  writeFileSync(join(existingDir, 'index.md'), 'original');
  const before = statSync(join(existingDir, 'index.md')).mtimeMs;
  const result = createBundle(params(), { postsDir, now: NOW });
  assert.equal(!result.ok && result.code, 'E-SLUG-EXISTS');
  assert.equal(readFileSync(join(existingDir, 'index.md'), 'utf8'), 'original');
  assert.equal(statSync(join(existingDir, 'index.md')).mtimeMs, before);
});

// 驗證順序：slug 格式 → 既存 → assets（覆蓋順序註記於 spec）
test('slug 不合法時優先回 E-SLUG-INVALID（即使 asset 也缺）', () => {
  const result = createBundle(
    params({ slug: 'Bad_Slug', assets: [join(assetsDir, 'nope.png')] }),
    { postsDir, now: NOW },
  );
  assert.equal(!result.ok && result.code, 'E-SLUG-INVALID');
});

// title 含 YAML 特殊字元不破壞 frontmatter
test('title 含雙引號與冒號 → frontmatter 正確跳脫', () => {
  const result = createBundle(params({ title: 'He said: "hi"' }), { postsDir, now: NOW });
  assert.equal(result.ok, true);
  const text = readFileSync(join(postsDir, 'test-post', 'index.md'), 'utf8');
  assert.match(text, /title: "He said: \\"hi\\""\n/);
});
