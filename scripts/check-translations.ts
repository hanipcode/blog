import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { assertProtectedContent, sourceHash } from './lib/translation.js';

const contentRoot = path.resolve('src/content/posts');
const englishRoot = path.join(contentRoot, 'en');
const englishPosts = await collectMarkdown(englishRoot);
const failures: string[] = [];

for (const englishPath of englishPosts) {
  const indonesianPath = englishPath.replace(`${path.sep}en${path.sep}`, `${path.sep}id${path.sep}`);

  try {
    const englishSource = await readFile(englishPath, 'utf8');
    const indonesianSource = await readFile(indonesianPath, 'utf8');
    const english = matter(englishSource);
    const indonesian = matter(indonesianSource);
    const originalLocale = english.data.originalLocale
      ?? indonesian.data.originalLocale
      ?? (english.data.sourceHash ? 'id' : 'en');
    const original = originalLocale === 'en' ? english : indonesian;
    const originalSource = originalLocale === 'en' ? englishSource : indonesianSource;
    const translated = originalLocale === 'en' ? indonesian : english;
    const translatedPath = originalLocale === 'en' ? indonesianPath : englishPath;

    if (translated.data.sourceHash !== sourceHash(originalSource)) {
      failures.push(`Stale: ${path.relative(process.cwd(), translatedPath)}`);
      continue;
    }

    try {
      assertProtectedContent(original.content, translated.content);
    } catch {
      failures.push(`Protected content changed: ${path.relative(process.cwd(), translatedPath)}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      failures.push(`Missing: ${path.relative(process.cwd(), indonesianPath)}`);
    } else {
      throw error;
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Checked ${englishPosts.length} bilingual pair(s).`);

async function collectMarkdown(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectMarkdown(entryPath) : [entryPath];
  }));

  return paths.flat().filter((entryPath) => /\/index\.mdx?$/.test(entryPath));
}
