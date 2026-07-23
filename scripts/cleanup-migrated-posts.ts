import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { sourceHash } from './lib/translation.js';

type Locale = 'en' | 'id';

const contentRoot = path.resolve('src/content/posts');

async function main() {
  const files = [
    ...(await collectMarkdown(path.join(contentRoot, 'en'))),
    ...(await collectMarkdown(path.join(contentRoot, 'id'))),
  ];

  for (const file of files) {
    const source = matter(await readFile(file, 'utf8'));
    const key = String(source.data.translationKey);
    const cleaned = addFenceLanguages(normalizeMultilineImages(repairLinkedImages(removePlatformUi(source.content))), key);
    const tags = postTags[key] ?? source.data.tags;

    await writeFile(file, matter.stringify(cleaned.trimStart(), {
      ...source.data,
      tags,
    }));
  }

  for (const englishPath of await collectMarkdown(path.join(contentRoot, 'en'))) {
    const indonesianPath = englishPath.replace(`${path.sep}en${path.sep}`, `${path.sep}id${path.sep}`);
    const englishSource = await readFile(englishPath, 'utf8');
    const indonesianSource = await readFile(indonesianPath, 'utf8');
    const english = matter(englishSource);
    const indonesian = matter(indonesianSource);
    const originalLocale: Locale = english.data.originalLocale
      ?? indonesian.data.originalLocale
      ?? (english.data.sourceHash ? 'id' : 'en');
    const originalSource = originalLocale === 'en' ? englishSource : indonesianSource;
    const translatedPath = originalLocale === 'en' ? indonesianPath : englishPath;
    const translated = originalLocale === 'en' ? indonesian : english;

    await writeFile(translatedPath, matter.stringify(translated.content.trimStart(), {
      ...translated.data,
      sourceHash: sourceHash(originalSource),
    }));
  }

  console.log(`Cleaned ${files.length} localized post files.`);
}

export function removePlatformUi(markdown: string): string {
  return markdown
    .replace(/^Enter fullscreen mode Exit fullscreen mode\s*$/gm, '')
    .replace(/^Masuk(?: ke)? mode layar penuh Keluar dari mode layar penuh\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
}

export function repairLinkedImages(markdown: string): string {
  const lines = markdown.split('\n');
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() !== '[') {
      output.push(lines[index]);
      continue;
    }

    let closing = index + 1;
    while (closing < lines.length && closing <= index + 12) {
      if (lines[closing].trimStart().startsWith('](https://substackcdn.com/')) break;
      closing += 1;
    }

    if (closing >= lines.length || closing > index + 12) {
      output.push(lines[index]);
      continue;
    }

    const imageLines = lines.slice(index + 1, closing);
    while (imageLines[0]?.trim() === '') imageLines.shift();
    while (imageLines.at(-1)?.trim() === '') imageLines.pop();
    output.push(...imageLines);
    index = closing;
  }

  return output.join('\n').replace(/\n{3,}/g, '\n\n');
}

export function normalizeMultilineImages(markdown: string): string {
  const lines = markdown.split('\n');
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].startsWith('![Sell this pen')) {
      output.push(lines[index]);
      continue;
    }

    let closing = index + 1;
    while (closing < lines.length && closing <= index + 10) {
      if (lines[closing].trimStart().startsWith('](https://substackcdn.com/')) break;
      closing += 1;
    }

    if (closing >= lines.length || closing > index + 10) {
      output.push(lines[index]);
      continue;
    }

    const url = lines[closing].trim().slice(2, -1);
    output.push(`![Sell this pen - It's MCP-Powered](${url})`);
    index = closing;
  }

  return output.join('\n');
}

export function addFenceLanguages(markdown: string, slug: string): string {
  const lines = markdown.split('\n');
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].startsWith('```')) continue;

    if (inFence) {
      inFence = false;
      continue;
    }

    inFence = true;
    if (lines[index].trim() !== '```') continue;

    const closing = lines.findIndex((line, candidate) => candidate > index && line.trim() === '```');
    if (closing === -1) continue;
    const code = lines.slice(index + 1, closing).join('\n');
    lines[index] = `\`\`\`${inferLanguage(code, slug)}`;
  }

  return lines.join('\n');
}

function inferLanguage(code: string, slug: string): string {
  const trimmed = code.trim();

  if (/^(brew|npm|npx|pnpm|yarn|git|curl|mkdir|cd|docker|bun|node|ln)\b/m.test(trimmed)) return 'bash';
  if (/^(GET|POST|PUT|PATCH|DELETE)\s+\//m.test(trimmed) && !/[;{}]/.test(trimmed)) return 'text';
  if (/^(RangeError|TypeError|Error:|Authorization:|opengl-|├|└|│)/m.test(trimmed)) return 'text';
  if (/^(SELECT|INSERT|UPDATE|DELETE FROM|CREATE TABLE)\b/im.test(trimmed)) return 'sql';
  if (/^(cmake_minimum_required|project\(|set\(|add_executable|target_link_libraries|find_package)/m.test(trimmed)) return 'cmake';
  if (/#include\s*[<"]|std::|glfw[A-Z]|int\s+main\s*\(/.test(trimmed)) return 'cpp';
  if (/^(services:|version:|name:)|\n\s+(image|ports|environment):/m.test(trimmed)) return 'yaml';
  if (/^\s*[\[{]\s*["']?[\w$-]+["']?\s*:/m.test(trimmed) && /[}\]]\s*$/.test(trimmed)) return 'json';
  if (/<(div|span|button|input|header|p)\b/.test(trimmed)) {
    return /interface\s+\w+|:\s*(string|boolean|number)|<\w+>/.test(trimmed) ? 'tsx' : 'jsx';
  }
  if (/^[.#]?[\w-]+\s*\{|:\s*[^;{}]+;/m.test(trimmed)) return 'css';
  if (/interface\s+\w+|type\s+\w+\s*=|:\s*(string|boolean|number|Router|Request|Response)\b/.test(trimmed)) return 'typescript';
  if (slug.includes('opengl')) return trimmed.includes('=') || trimmed.includes(';') ? 'cpp' : 'text';
  if (slug.includes('tailwind')) return 'typescript';
  return 'javascript';
}

async function collectMarkdown(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectMarkdown(entryPath) : [entryPath];
  }));
  return nested.flat().filter((file) => /\/index\.mdx?$/.test(file));
}

const postTags: Record<string, string[]> = {
  '1-pure-function': ['JavaScript', 'Functional Programming'],
  'apa-itu-functor': ['JavaScript', 'Functional Programming'],
  'belajar-adalah-dialog': ['Learning', 'Career'],
  'belajar-singleton-pattern': ['JavaScript', 'Design Patterns', 'Frontend'],
  'benchmarking-bun-and-node-for-user': ['Bun', 'Node.js', 'Backend', 'Performance'],
  'building-an-express-application-with-express-kun-a-functional-paradigm-express-helper-part-1-intro-and-setup-26gp': ['TypeScript', 'Express', 'Backend'],
  'creating-a-simple-express-jwt-authentication-middleware-in-5-minutes-with-express-kun-4aa3': ['JavaScript', 'Express', 'Authentication'],
  'first-post': ['Meta', 'Static Sites'],
  'gerakan-dalam-pusaran-digital': ['Technology', 'Society', 'Opinion'],
  'interactive-writing': ['Astro', 'MDX'],
  'making-tailwind-more-functional-by-using-pipeable-api-in-tailwind-fun-3cc9': ['TypeScript', 'Tailwind CSS', 'Functional Programming'],
  'manajemen-class-dengan-classnames': ['React', 'CSS', 'Frontend'],
  'memory-di-javascript': ['JavaScript', 'Performance'],
  'memulai-karir-frontend': ['Career', 'Frontend', 'Learning'],
  'not-every-self-learning-journey-is': ['Learning', 'Career'],
  'react-native-js-only-environment-variable-library-p86': ['JavaScript', 'React Native', 'Open Source'],
  'rough-edges-of-current-state-of-ai': ['AI', 'Frontend', 'Developer Tools'],
  'setting-up-opengl-development-on': ['C++', 'OpenGL', 'macOS'],
  'simplify-your-tailwind-css-workflow-with-tailwind-fun': ['TypeScript', 'Tailwind CSS', 'Frontend'],
  'test-tambah-posting': ['GitHub', 'Writing'],
  'things-i-learned-while-developing-express-kun-backend-helpers-for-express-app-development-j44': ['JavaScript', 'Express', 'Backend'],
  'tulisan-tentang-react': ['React', 'Frontend', 'Architecture'],
  'undoable': ['JavaScript', 'Functional Programming', 'Data Structures'],
  'why-hard-to-survive-in-it': ['Career', 'Technology', 'Community'],
};

await main();
