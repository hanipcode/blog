import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

type Locale = 'en' | 'id';

const contentRoot = path.resolve('src/content/posts');
const force = process.argv.includes('--force');
const sources = [
  ...(await collectMarkdown(path.join(contentRoot, 'en'))).map((file) => ({ file, locale: 'en' as const })),
  ...(await collectMarkdown(path.join(contentRoot, 'id'))).map((file) => ({ file, locale: 'id' as const })),
];
const sourcePaths = new Set(sources.map(({ file }) => file));
const missing = sources.filter(({ file, locale }) => {
  const targetLocale: Locale = locale === 'en' ? 'id' : 'en';
  return !sourcePaths.has(swapLocale(file, locale, targetLocale));
});

if (missing.length === 0) {
  console.log('Every post already has an EN and ID version.');
  process.exit(0);
}

console.log(`Generating ${missing.length} missing translation(s).`);

for (const [index, source] of missing.entries()) {
  const targetLocale: Locale = source.locale === 'en' ? 'id' : 'en';
  console.log(`[${index + 1}/${missing.length}] ${path.relative(process.cwd(), source.file)} -> ${targetLocale}`);
  await runTranslation(source.file, targetLocale);
}

async function collectMarkdown(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectMarkdown(entryPath) : [entryPath];
  }));
  return nested.flat().filter((file) => /\/index\.mdx?$/.test(file));
}

function swapLocale(file: string, source: Locale, target: Locale): string {
  return file.replace(`${path.sep}${source}${path.sep}`, `${path.sep}${target}${path.sep}`);
}

function runTranslation(source: string, target: Locale): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ['exec', 'tsx', 'scripts/translate-post.ts', source, '--to', target];
    if (force) command.push('--force');
    const child = spawn('pnpm', command, { stdio: 'inherit' });

    child.once('error', reject);
    child.once('exit', (code) => code === 0
      ? resolve()
      : reject(new Error(`Translation failed for ${source} with exit code ${code}`)));
  });
}
