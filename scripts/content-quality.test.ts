import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';

const contentRoot = path.resolve('src/content/posts');

describe('migrated content quality', () => {
  it('contains no source-platform controls or malformed linked images', async () => {
    for (const file of await collectMarkdown(contentRoot)) {
      const source = await readFile(file, 'utf8');
      expect(source, file).not.toMatch(/fullscreen mode|mode layar penuh/i);
      expect(source, file).not.toMatch(/^\[$/m);
      expect(source, file).not.toMatch(/^\]\(https:\/\/substackcdn\.com/m);
    }
  });

  it('labels every fenced code block and closes every fence', async () => {
    for (const file of await collectMarkdown(contentRoot)) {
      const { content } = matter(await readFile(file, 'utf8'));
      let inFence = false;

      for (const line of content.split('\n')) {
        if (!line.startsWith('```')) continue;
        if (!inFence) expect(line, file).not.toBe('```');
        inFence = !inFence;
      }

      expect(inFence, file).toBe(false);
    }
  });

  it('uses meaningful tags instead of migration placeholders', async () => {
    for (const file of await collectMarkdown(contentRoot)) {
      const { data } = matter(await readFile(file, 'utf8'));
      expect(data.tags, file).not.toContain('Archive');
      expect(data.tags, file).not.toContain('untagged');
      expect(data.tags.length, file).toBeGreaterThan(0);
    }
  });
});

async function collectMarkdown(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectMarkdown(entryPath) : [entryPath];
  }));
  return nested.flat().filter((file) => /\/index\.mdx?$/.test(file));
}
