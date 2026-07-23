import { describe, expect, it } from 'vitest';
import {
  applyTranslations,
  assertProtectedContent,
  collectTranslationSegments,
} from './translation.js';

const source = `# A technical post

Use \`const value = 1\` in this example.

\`\`\`ts
const userName = 'Hanif';
\`\`\`

\`\`\`mermaid
graph TD
  A[Build] --> B[Deploy]
\`\`\`

<Callout kind="note">This text can change.</Callout>
`;

describe('translation protection', () => {
  it('extracts prose but not code or Mermaid source', () => {
    const text = collectTranslationSegments(source).map((segment) => segment.text);

    expect(text).toContain('A technical post');
    expect(text).toContain('This text can change.');
    expect(text).not.toContain('const value = 1');
    expect(text).not.toContain('graph TD\n  A[Build] --> B[Deploy]');
  });

  it('retains protected nodes after applying translations', () => {
    const segments = collectTranslationSegments(source);
    const translations = new Map(segments.map((segment) => [segment.id, `ID: ${segment.text}`]));
    const translated = applyTranslations(source, segments, translations);

    expect(() => assertProtectedContent(source, translated)).not.toThrow();
    expect(translated).toContain("const userName = 'Hanif';");
  });
});
