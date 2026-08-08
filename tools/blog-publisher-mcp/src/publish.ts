import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export interface PublishParams {
  title: string;
  slug: string;
  content: string;
  tags: string[];
  categories: string[];
  assets: string[];
}

export type PublishErrorCode = 'E-SLUG-INVALID' | 'E-SLUG-EXISTS' | 'E-ASSET-MISSING';

export type BundleResult =
  | { ok: true; bundleDir: string }
  | { ok: false; code: PublishErrorCode; message: string };

function formatDate(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
}

// JSON 字串是合法的 YAML 雙引號 scalar，跳脫交給 JSON.stringify
function yamlString(value: string): string {
  return JSON.stringify(value);
}

function yamlList(name: string, items: string[]): string {
  if (items.length === 0) return `${name}: []`;
  return `${name}:\n${items.map((item) => `- ${yamlString(item)}`).join('\n')}`;
}

export function renderFrontmatter(params: PublishParams, now: Date): string {
  return [
    '---',
    `title: ${yamlString(params.title)}`,
    `date: ${formatDate(now)}`,
    `slug: ${yamlString(params.slug)}`,
    yamlList('tags', params.tags),
    yamlList('categories', params.categories),
    '---',
  ].join('\n');
}

/**
 * 驗證參數並建立 page bundle（PUB-R-02/03/07/08/09）。
 * 驗證全部通過才落任何檔案；驗證失敗時保證零檔案變更。
 */
export function createBundle(
  params: PublishParams,
  opts: { postsDir: string; now: Date },
): BundleResult {
  if (!SLUG_PATTERN.test(params.slug)) {
    return {
      ok: false,
      code: 'E-SLUG-INVALID',
      message: `slug "${params.slug}" 不符合 kebab-case 格式（^[a-z0-9]+(-[a-z0-9]+)*$）`,
    };
  }

  const bundleDir = join(opts.postsDir, params.slug);
  if (existsSync(bundleDir)) {
    return {
      ok: false,
      code: 'E-SLUG-EXISTS',
      message: `content/posts/${params.slug}/ 已存在，換一個 slug 或先移除既有文章`,
    };
  }

  const missing = params.assets.filter((asset) => !existsSync(asset));
  if (missing.length > 0) {
    return {
      ok: false,
      code: 'E-ASSET-MISSING',
      message: `找不到 asset 檔案：${missing.join(', ')}`,
    };
  }

  mkdirSync(bundleDir, { recursive: true });
  writeFileSync(join(bundleDir, 'index.md'), `${renderFrontmatter(params, opts.now)}\n\n${params.content}`);
  for (const asset of params.assets) {
    copyFileSync(asset, join(bundleDir, basename(asset)));
  }
  return { ok: true, bundleDir };
}
