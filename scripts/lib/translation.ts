import { createHash } from 'node:crypto';
import type { Root } from 'mdast';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

type SyntaxNode = {
  type: string;
  value?: string;
  children?: SyntaxNode[];
  position?: {
    start: { offset?: number };
    end: { offset?: number };
  };
};

export interface TranslationSegment {
  id: string;
  text: string;
  start: number;
  end: number;
}

const protectedTypes = new Set([
  'code',
  'inlineCode',
  'html',
  'mdxFlowExpression',
  'mdxTextExpression',
  'mdxjsEsm',
  'yaml',
]);

export function sourceHash(source: string): string {
  return createHash('sha256').update(source).digest('hex').slice(0, 16);
}

export function parseMdx(source: string): Root {
  try {
    return unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkFrontmatter, ['yaml'])
      .parse(source);
  } catch {
    return unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ['yaml'])
      .parse(source);
  }
}

export function collectTranslationSegments(source: string): TranslationSegment[] {
  const tree = parseMdx(source) as SyntaxNode;
  const segments: TranslationSegment[] = [];

  const visit = (node: SyntaxNode, blocked = false) => {
    const isBlocked = blocked || protectedTypes.has(node.type);

    if (node.type === 'text' && !isBlocked && node.position) {
      const start = node.position.start.offset;
      const end = node.position.end.offset;
      if (start !== undefined && end !== undefined && source.slice(start, end).trim()) {
        segments.push({
          id: `body-${segments.length + 1}`,
          text: source.slice(start, end),
          start,
          end,
        });
      }
    }

    node.children?.forEach((child) => visit(child, isBlocked));
  };

  visit(tree);
  return segments;
}

export function applyTranslations(
  source: string,
  segments: TranslationSegment[],
  translations: Map<string, string>,
): string {
  return [...segments]
    .sort((a, b) => b.start - a.start)
    .reduce((result, segment) => {
      const replacement = translations.get(segment.id);
      if (replacement === undefined) throw new Error(`Missing translation for ${segment.id}`);
      return result.slice(0, segment.start) + replacement + result.slice(segment.end);
    }, source);
}

export function protectedSlices(source: string): string[] {
  const tree = parseMdx(source) as SyntaxNode;
  const slices: string[] = [];

  const visit = (node: SyntaxNode, parentProtected = false) => {
    const isProtected = protectedTypes.has(node.type);
    if (isProtected && !parentProtected && node.position) {
      const start = node.position.start.offset;
      const end = node.position.end.offset;
      if (start !== undefined && end !== undefined) slices.push(source.slice(start, end));
    }

    node.children?.forEach((child) => visit(child, parentProtected || isProtected));
  };

  visit(tree);
  return slices;
}

export function assertProtectedContent(original: string, translated: string): void {
  const before = protectedSlices(original);
  const after = protectedSlices(translated);

  if (before.length !== after.length || before.some((slice, index) => slice !== after[index])) {
    throw new Error('Translation changed protected code, Mermaid, HTML, JSX expression, or import content.');
  }
}
