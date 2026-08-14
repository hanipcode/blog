# Personal blog

An Astro and MDX personal blog with static English and Indonesian content, interactive post-local components, Shiki highlighting, Mermaid, embeds, and theme switching.

## Commands

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

Generate a translation manually with the locally authenticated Codex CLI:

```bash
pnpm translate src/content/posts/en/my-post/index.mdx --to id
pnpm translate src/content/posts/id/my-post/index.mdx --to en
```

The command is never run by `pnpm build` or a Git hook. Existing translations are not overwritten unless `--force` is supplied, protecting any manual touch-ups. Review and commit the generated MDX file when it is ready.

Generate every missing EN or ID counterpart:

```bash
pnpm translate:all
```

Translate every staged, unstaged, or untracked post:

```bash
pnpm translate:changed
```

This skips counterpart files that also have uncommitted changes, protecting manual touch-ups. Use `pnpm translate:changed --force` only when those edits should be overwritten intentionally.

Translation freshness can be checked manually when wanted:

```bash
pnpm translations:check
```

Normalize imported platform artifacts, image wrappers, code-fence languages, tags, and translation hashes:

```bash
pnpm cleanup:posts
```

## Writing

Create posts under `src/content/posts/<locale>/<slug>/index.mdx`. Post-specific Astro components can live in the same folder and be imported with a relative path. Shared components live under `src/components/mdx`.

Bootstrap a metadata-only draft with OpenCode and GPT Luna:

```bash
just create-post "My post title" "What the post will cover"
```

The title and post description are used to infer the locale, slug, polished description, tags, and remaining frontmatter. The generated file has no body and remains a draft until it is ready to publish.

Counterpart translations use the same relative path in the other locale. `pnpm build` does not generate or validate translations; it only runs Astro type checking and creates the static site in `dist`.

Set `devOnly: true` in both localized files to show a post with `pnpm dev` while excluding it from production listings and routes.

Cloudflare Pages can deploy the repository with build command `pnpm build` and output directory `dist`.
