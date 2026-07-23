import { execFile, spawn } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import matter from 'gray-matter';

const execFileAsync = promisify(execFile);
const force = process.argv.includes('--force');
const { stdout } = await execFileAsync(
  'git',
  ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
  { encoding: 'utf8' },
);
const changedPaths = parseGitStatus(stdout);
const changedPosts = [...changedPaths]
  .filter((file) => /^src\/content\/posts\/(en|id)\/.+\.mdx?$/.test(file))
  .sort();

if (changedPosts.length === 0) {
  console.log('No uncommitted posts to translate.');
  process.exit(0);
}

let translated = 0;
let skipped = 0;

for (const sourcePath of changedPosts) {
  try {
    await access(sourcePath);
  } catch {
    console.log(`Skipping deleted post: ${sourcePath}`);
    skipped += 1;
    continue;
  }

  const source = matter(await readFile(sourcePath, 'utf8'));
  if (source.data.sourceHash) {
    console.log(`Skipping generated translation: ${sourcePath}`);
    skipped += 1;
    continue;
  }

  const sourceLocale = sourcePath.includes('/posts/en/') ? 'en' : 'id';
  const targetLocale = sourceLocale === 'en' ? 'id' : 'en';
  const targetPath = sourcePath.replace(`/posts/${sourceLocale}/`, `/posts/${targetLocale}/`);
  if (!force && changedPaths.has(targetPath)) {
    console.log(`Skipping translation with uncommitted edits: ${targetPath}`);
    skipped += 1;
    continue;
  }

  console.log(`Translating ${sourcePath}`);
  await runTranslation(sourcePath, targetLocale);
  translated += 1;
}

console.log(`Translated ${translated} post(s); skipped ${skipped}.`);

function parseGitStatus(output: string): Set<string> {
  const records = output.split('\0');
  const paths = new Set<string>();

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (!record) continue;

    const status = record.slice(0, 2);
    paths.add(record.slice(3));

    if (status.includes('R') || status.includes('C')) index += 1;
  }

  return paths;
}

function runTranslation(sourcePath: string, targetLocale: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'pnpm',
      ['exec', 'tsx', 'scripts/translate-post.ts', sourcePath, '--to', targetLocale, '--force'],
      { stdio: 'inherit' },
    );

    child.once('error', reject);
    child.once('exit', (code) => code === 0
      ? resolve()
      : reject(new Error(`Translation failed for ${sourcePath} with exit code ${code}`)));
  });
}
