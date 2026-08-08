import { join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { createBundle, expectedUrl } from './publish.js';
import { runHugoBuild } from './build.js';
import { commitAndPush } from './git.js';

export const publishPostInputSchema = z.object({
  title: z.string().min(1).describe('Article title (may contain any language)'),
  slug: z.string().describe('URL slug in kebab-case, e.g. my-first-post'),
  content: z.string().min(1).describe('Markdown body, without frontmatter'),
  tags: z.array(z.string()).default([]).describe('Frontmatter tags'),
  categories: z.array(z.string()).default([]).describe('Frontmatter categories'),
  assets: z
    .array(z.string())
    .default([])
    .describe('Absolute paths of asset files to copy into the page bundle'),
});

export interface ServerOptions {
  repoDir: string;
  baseUrl?: string;
  now?: () => Date;
}

const BASE_URL = 'https://metavige.github.io';

function errorResult(code: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `${code}: ${message}` }],
    isError: true,
  };
}

export function createServer(options: ServerOptions): McpServer {
  const baseUrl = options.baseUrl ?? BASE_URL;
  const nowFn = options.now ?? (() => new Date());
  const server = new McpServer({ name: 'blog-publisher', version: '0.1.0' });

  server.registerTool(
    'publish_post',
    {
      title: 'Publish blog post',
      description:
        'Publish a new article to the Hugo blog: create the page bundle, verify with a local hugo build, commit and push to origin master, then return the expected live URL.',
      inputSchema: publishPostInputSchema,
    },
    async (params) => {
      const now = nowFn();
      const bundle = createBundle(params, {
        postsDir: join(options.repoDir, 'content', 'posts'),
        now,
      });
      if (!bundle.ok) return errorResult(bundle.code, bundle.message);

      const build = runHugoBuild({ siteDir: options.repoDir });
      if (!build.ok) {
        return errorResult(
          build.code,
          `${build.message}\n\nbundle 檔案保留於 ${bundle.bundleDir} 供檢查，未 commit。`,
        );
      }

      const pushed = commitAndPush({
        repoDir: options.repoDir,
        bundleDir: bundle.bundleDir,
        title: params.title,
      });
      if (!pushed.ok) return errorResult(pushed.code, pushed.message);

      const url = expectedUrl(baseUrl, params.slug, now);
      return {
        content: [{ type: 'text' as const, text: `已發佈，預期上線 URL：${url}` }],
      };
    },
  );

  return server;
}
