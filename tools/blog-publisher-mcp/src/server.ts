import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

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

export function createServer(): McpServer {
  const server = new McpServer({ name: 'blog-publisher', version: '0.1.0' });

  server.registerTool(
    'publish_post',
    {
      title: 'Publish blog post',
      description:
        'Publish a new article to the Hugo blog: create the page bundle, verify with a local hugo build, commit and push to origin master, then return the expected live URL.',
      inputSchema: publishPostInputSchema,
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: 'E-NOT-IMPLEMENTED: publish_post 尚未實作，發佈流程將於後續版本提供',
        },
      ],
      isError: true,
    }),
  );

  return server;
}
