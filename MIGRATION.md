# Legacy post migration

The repository includes posts migrated from:

- `hanipcode/blog`: 12 Indonesian Markdown posts, including three drafts
- `hanipcode/my-blog`: one Tailwind article, deduplicated against its earlier Dev.to publication
- Dev.to: six English articles
- Substack: five articles, four English and one Indonesian

This produced 23 unique migrated originals. Every original has a generated counterpart in the other language. Together with the development-only interactive example, the collection contains 24 EN/ID pairs.

## Conversion rules

- Original publication dates, draft state, tags, and canonical links are retained.
- Hugo Mermaid shortcodes are converted to fenced `mermaid` blocks.
- Dev.to article bodies are extracted without comments or surrounding community UI.
- Substack subscription widgets are removed and article HTML is converted to GFM.
- The duplicate Tailwind post uses its original 2023 Dev.to publication date and content.
- The copied draft title `FP di JS: Apa Itu Functor` is corrected to `FP di JS: Apa Itu Pure Function` for the pure-function article.
- Existing code examples are preserved as written, including historical typos or outdated APIs.
- Dev.to fullscreen controls are removed, Substack linked-image wrappers are normalized, and unlabeled code fences receive inferred Shiki languages.
- Every post uses topic-specific tags shared by its EN and ID versions.

Generated translations are intended to be reviewed and manually refined. Run `pnpm translations:check` to verify that every pair exists, its source hash is current, and protected technical blocks remain unchanged.
