import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import matter from 'gray-matter';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

type Locale = 'en' | 'id';

interface DevArticle {
  id: number;
  title: string;
  description: string;
  slug: string;
  published_at: string;
  tag_list: string[];
  canonical_url: string;
}

interface SubstackPost {
  title: string;
  subtitle: string;
  description: string;
  slug: string;
  post_date: string;
  canonical_url: string;
  body_html: string;
  language: Locale;
}

const args = process.argv.slice(2);
const rootIndex = args.indexOf('--hugo-root');
const hugoRoot = rootIndex >= 0 ? path.resolve(args[rootIndex + 1]) : undefined;
const force = args.includes('--force');
const contentRoot = path.resolve('src/content/posts');
const substackTags: Record<string, string[]> = {
  'not-every-self-learning-journey-is': ['Learning', 'Career'],
  'memory-di-javascript': ['JavaScript', 'Performance'],
  'benchmarking-bun-and-node-for-user': ['Bun', 'Node.js', 'Backend'],
  'rough-edges-of-current-state-of-ai': ['AI', 'Frontend'],
  'setting-up-opengl-development-on': ['C++', 'OpenGL', 'macOS'],
};

if (!hugoRoot) {
  throw new Error('Usage: pnpm import:legacy --hugo-root <path-to-old-blog> [--force]');
}

const imported: string[] = [];
const skipped: string[] = [];

await importHugoPosts();
await importDevArticles();
await importSubstackPosts();

console.log(`Imported ${imported.length} post(s); skipped ${skipped.length}.`);
if (skipped.length) console.log(`Already present:\n${skipped.join('\n')}`);

async function importHugoPosts() {
  const postsRoot = path.join(hugoRoot as string, 'content/posts');
  const sourceFiles = await collectMarkdown(postsRoot);

  for (const sourcePath of sourceFiles) {
    const source = matter(await readFile(sourcePath, 'utf8'));
    const slug = path.basename(sourcePath, path.extname(sourcePath));
    const title = slug === '1-pure-function' ? 'FP di JS: Apa Itu Pure Function' : String(source.data.title);
    let body = convertHugoMarkdown(source.content);
    body = removeDuplicateHeading(body, title);

    await savePost({
      locale: 'id',
      slug,
      title,
      description: excerpt(body),
      publishedAt: new Date(source.data.date).toISOString(),
      tags: source.data.tags?.includes('untagged') ? ['Archive'] : source.data.tags ?? ['Archive'],
      draft: Boolean(source.data.draft),
      body,
    });
  }
}

async function importDevArticles() {
  const articles = await fetchJson<DevArticle[]>('https://dev.to/api/articles?username=hanipcode&per_page=1000');

  for (const article of articles) {
    const slug = article.id === 1491912
      ? 'simplify-your-tailwind-css-workflow-with-tailwind-fun'
      : article.slug;
    if (!force && await postExists('en', slug)) {
      skipped.push(path.relative(process.cwd(), postPath('en', slug)));
      continue;
    }

    const body = await fetchDevArticle(article.canonical_url);

    await savePost({
      locale: 'en',
      slug,
      title: article.title,
      description: article.description || excerpt(body),
      publishedAt: article.published_at,
      tags: article.tag_list,
      draft: false,
      canonicalUrl: article.canonical_url,
      body,
    });
    await delay(1_000);
  }
}

async function importSubstackPosts() {
  const archive = await fetchJson<Array<Pick<SubstackPost, 'slug'>>>(
    'https://hanipcode.substack.com/api/v1/archive?sort=new&search=&offset=0&limit=12',
  );

  for (const item of archive) {
    const post = await fetchJson<SubstackPost>(`https://hanipcode.substack.com/api/v1/posts/${item.slug}`);
    const body = substackToMarkdown(post.body_html);

    await savePost({
      locale: post.language,
      slug: post.slug,
      title: post.title.trim(),
      description: (post.description || post.subtitle || excerpt(body)).trim(),
      publishedAt: post.post_date,
      tags: substackTags[post.slug] ?? ['Essay'],
      draft: false,
      canonicalUrl: post.canonical_url,
      body,
    });
  }
}

async function savePost(post: {
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  draft: boolean;
  canonicalUrl?: string;
  body: string;
}) {
  const target = postPath(post.locale, post.slug);

  if (!force) {
    try {
      await readFile(target);
      skipped.push(path.relative(process.cwd(), target));
      return;
    } catch {
      // A missing target is expected on the first import.
    }
  }

  const output = matter.stringify(`${post.body.trim()}\n`, {
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    locale: post.locale,
    originalLocale: post.locale,
    translationKey: post.slug,
    tags: post.tags,
    draft: post.draft,
    ...(post.canonicalUrl ? { canonicalUrl: post.canonicalUrl } : {}),
  });

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, output);
  imported.push(path.relative(process.cwd(), target));
  console.log(`Imported ${path.relative(process.cwd(), target)}`);
}

function convertHugoMarkdown(markdown: string): string {
  return markdown.replace(
    /{{<\s*mermaid\s*>}}\s*([\s\S]*?)\s*{{<\s*\/mermaid\s*>}}/g,
    (_, diagram: string) => `\n\`\`\`mermaid\n${diagram.trim()}\n\`\`\`\n`,
  );
}

function removeDuplicateHeading(markdown: string, title: string): string {
  const match = markdown.match(/^\s*#\s+(.+)\n+/);
  if (!match) return markdown;

  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return normalize(match[1]) === normalize(title) ? markdown.slice(match[0].length) : markdown;
}

function excerpt(markdown: string): string {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return prose.length > 180 ? `${prose.slice(0, 177).trimEnd()}...` : prose;
}

function substackToMarkdown(html: string): string {
  return htmlToMarkdown(html, true);
}

function htmlToMarkdown(html: string, removeSubscriptions = false): string {
  const turndown = new TurndownService({
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    headingStyle: 'atx',
  });
  turndown.use(gfm);
  turndown.remove(['form', 'button', 'input', 'script', 'style']);
  if (removeSubscriptions) {
    turndown.addRule('subscription-widgets', {
      filter: (node) => node.nodeType === 1 && (node as HTMLElement).classList.contains('subscription-widget-wrap-editor'),
      replacement: () => '',
    });
  }

  return turndown.turndown(html).replace(/\n{3,}/g, '\n\n').trim();
}

async function fetchDevArticle(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': 'hanipcode-blog-migrator' } });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);

  const $ = load(await response.text());
  const article = $('#article-body').html();
  if (!article) throw new Error(`Could not find article body at ${url}`);
  return htmlToMarkdown(article);
}

async function collectMarkdown(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectMarkdown(entryPath) : [entryPath];
  }));
  return nested.flat().filter((file) => /\.mdx?$/.test(file));
}

async function fetchJson<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url, { headers: { 'User-Agent': 'hanipcode-blog-migrator' } });
    if (response.ok) return response.json() as Promise<T>;
    if (response.status !== 429 || attempt === 4) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const retryAfter = Number(response.headers.get('retry-after')) || 2 ** (attempt + 1);
    console.log(`Rate limited by ${new URL(url).hostname}; retrying in ${retryAfter}s.`);
    await delay(retryAfter * 1_000);
  }

  throw new Error(`Failed to fetch ${url}`);
}

function postPath(locale: Locale, slug: string): string {
  return path.join(contentRoot, locale, slug, 'index.md');
}

async function postExists(locale: Locale, slug: string): Promise<boolean> {
  try {
    await readFile(postPath(locale, slug));
    return true;
  } catch {
    return false;
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
