import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';
import {
  applyTranslations,
  assertProtectedContent,
  collectTranslationSegments,
  sourceHash,
} from './lib/translation.js';

interface CodexResponse {
  translations: Array<{ id: string; text: string }>;
}

const args = process.argv.slice(2);
const sourceArg = args.find((arg) => !arg.startsWith('--'));
const targetIndex = args.indexOf('--to');
const targetLocale = targetIndex >= 0 ? args[targetIndex + 1] : 'id';
const force = args.includes('--force');

if (!sourceArg || !['en', 'id'].includes(targetLocale)) {
  console.error('Usage: pnpm translate <post.md> --to <en|id> [--force]');
  process.exit(1);
}

const sourcePath = path.resolve(sourceArg);
const normalized = sourcePath.split(path.sep).join('/');
const localeMatch = normalized.match(/\/src\/content\/posts\/(en|id)\//);
if (!localeMatch) {
  throw new Error('The source must be under src/content/posts/en/ or src/content/posts/id/.');
}
const sourceLocale = localeMatch[1] as 'en' | 'id';
if (sourceLocale === targetLocale) throw new Error('Source and target locale must be different.');

const targetPath = sourcePath.replace(
  `${path.sep}${sourceLocale}${path.sep}`,
  `${path.sep}${targetLocale}${path.sep}`,
);
const source = await readFile(sourcePath, 'utf8');
const hash = sourceHash(source);

try {
  const existing = matter(await readFile(targetPath, 'utf8'));
  if (existing.data.sourceHash === hash) {
    console.log(`Translation is already current: ${path.relative(process.cwd(), targetPath)}`);
    process.exit(0);
  }
  if (!force) {
    throw new Error(`Translation exists and is stale. Review it, then rerun with --force: ${targetPath}`);
  }
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

const parsed = matter(source);
const bodySegments = collectTranslationSegments(parsed.content);
const segments = [
  { id: 'frontmatter-title', text: String(parsed.data.title) },
  { id: 'frontmatter-description', text: String(parsed.data.description) },
  ...bodySegments.map(({ id, text }) => ({ id, text })),
];
const rules = await readFile(path.resolve(`translation/${targetLocale}-rules.md`), 'utf8');
const glossary = await readFile(path.resolve(`translation/${targetLocale}-glossary.json`), 'utf8');
const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'blog-translation-'));
const schemaPath = path.join(temporaryDirectory, 'schema.json');
const outputPath = path.join(temporaryDirectory, 'result.json');

const schema = {
  type: 'object',
  properties: {
    translations: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, text: { type: 'string' } },
        required: ['id', 'text'],
        additionalProperties: false,
      },
    },
  },
  required: ['translations'],
  additionalProperties: false,
};

await writeFile(schemaPath, JSON.stringify(schema));

const prompt = [
  `Translate the supplied ${sourceLocale === 'en' ? 'English' : 'Indonesian'} blog segments into ${targetLocale === 'en' ? 'English' : 'Indonesian'}.`,
  'Return exactly one translation for every ID using the required JSON schema.',
  'Do not add commentary. Preserve Markdown punctuation contained in each segment.',
  '',
  'Translation rules:',
  rules,
  '',
  'Terminology glossary:',
  glossary,
  '',
  'Segments:',
  JSON.stringify(segments, null, 2),
].join('\n');

try {
  await runCodex(prompt, schemaPath, outputPath);
  const response = JSON.parse(await readFile(outputPath, 'utf8')) as CodexResponse;
  const translations = new Map(response.translations.map(({ id, text }) => [id, text]));

  if (translations.size !== segments.length || segments.some(({ id }) => !translations.has(id))) {
    throw new Error('Codex returned an incomplete or duplicate translation set.');
  }

  const translatedBody = applyTranslations(parsed.content, bodySegments, translations);
  assertProtectedContent(parsed.content, translatedBody);

  const translatedSource = matter.stringify(translatedBody, {
    ...parsed.data,
    title: translations.get('frontmatter-title'),
    description: translations.get('frontmatter-description'),
    locale: targetLocale,
    originalLocale: parsed.data.originalLocale ?? sourceLocale,
    sourceHash: hash,
  });

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, translatedSource);
  console.log(`Wrote ${path.relative(process.cwd(), targetPath)}`);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

function runCodex(prompt: string, schema: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'codex',
      [
        'exec',
        '--skip-git-repo-check',
        '--ephemeral',
        '--sandbox',
        'read-only',
        '-c',
        'model_reasoning_effort="low"',
        '--output-schema',
        schema,
        '--output-last-message',
        output,
        '-',
      ],
      { stdio: ['pipe', 'inherit', 'inherit'] },
    );

    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`Codex exited with code ${code}`)));
    child.stdin.end(prompt);
  });
}
