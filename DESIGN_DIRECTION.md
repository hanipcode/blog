# Homepage Design Direction — Implementation Brief

Audience: an AI coding agent executing the redesign. This brief is prescriptive
and ordered. Follow tasks top to bottom. Each task lists its goal, the files to
touch, the exact change, and acceptance criteria.

**Hard rule:** Some tasks are marked `REQUIRES INPUT`. Do **not** invent emails,
metrics, dates, or system details. Stop and ask the human for those values before
editing. Fabricated credibility content is worse than an unfinished task.

---

## 0. Context & constraints (read before editing)

- Stack: Astro (static output), Newsreader (serif) + DM Mono, warm-paper palette
  with a terracotta accent, light + dark themes, EN/ID i18n.
- Key files:
  - `src/pages/[lang]/index.astro` — homepage structure
  - `src/data/profile.ts` — all homepage copy/data, per-locale (`en`, `id`)
  - `src/styles/global.css` — all page styles (single stylesheet)
  - `src/components/AvatarScene.astro` — hero 3D avatar + CSS fallback
- **Do not break:** existing accessibility (skip link, `dl/dt/dd` semantics,
  `aria-hidden` on decorative nodes, focus-visible styles, `prefers-reduced-motion`
  handling), responsive reflow, grid layout discipline, or EN/ID parity. Any copy
  change in `profile.ts` MUST be applied to **both** the `en` and `id` objects.
- Verify against the running dev server after each task group. `pnpm build` runs
  `astro check` — keep it passing.

---

## 1. Intent (what every change optimizes for)

The page must read as **credible, senior, precise** to senior engineers and
founders evaluating trust for high-stakes systems. When a choice reads as playful,
decorative, or template-default, it is wrong. Two goals:

1. Strengthen credibility signals.
2. Replace tasteful-default styling with **one committed, distinctive decision**
   (not more decoration).

---

## 2. P0 — Credibility fixes (do first)

### Task 2.1 — Replace the email `REQUIRES INPUT`
- Goal: remove the `@yahoo.co.id` address; it contradicts the senior positioning.
- File: `src/data/profile.ts` (`identity.email`, line ~6). Also used by the
  contact mailto in `index.astro` (`contactUrl`, `contact.emailLabel`).
- Action: ask the human for the preferred domain address, then replace the single
  source in `identity.email`. Confirm all usages resolve (hero primary CTA,
  contact panel).
- Accept: no `yahoo` string remains; both mailto links use the new address.

### Task 2.2 — Fix the Gojek case-study result `REQUIRES INPUT`
- Goal: the "Selected work" section is titled "Proof, not just a list of tools,"
  but the Gojek `result` has no measurable outcome.
- File: `src/data/profile.ts`, `caseStudies[2].result` (en ~88-89, id ~243-244).
- Action: ask the human for a concrete metric (%, time, count). If none exists,
  ask whether to demote the claim or drop the section's "Proof" framing. Do not
  fabricate a number.
- Accept: the result contains a concrete figure, or the human explicitly approved
  a non-numeric version. Both locales updated.

### Task 2.3 — Make the metrics row a coherent set `REQUIRES INPUT`
- Goal: `10+ / 1M / 40% / 3` mixes four value styles; bare "3" is an anticlimax
  next to "1M".
- File: `src/data/profile.ts` (`sharedMetrics` ~11, `metrics` arrays both locales).
- Action: propose a consistent formatting scheme and a stronger fourth metric to
  the human; apply once approved.
- Accept: four values scan as one set; both locales updated.

### Task 2.4 — Unify voice to first person
- Goal: hero is "I…" but CTAs say "Write to Muhammad" / "Let's talk".
- File: `src/data/profile.ts` (`contact.action`, `hero.primaryCta`, and the nav
  "Let's talk" label — locate its source, likely a layout/nav component).
- Action: rewrite to consistent first person across both locales.
- Accept: no third-person self-reference remains in homepage-visible copy.

---

## 3. P1 — Core design weaknesses

### Task 3.1 — Make the case-study "diagrams" real or honestly decorative `REQUIRES INPUT`
- Problem: `.system-diagram` (markup `index.astro` ~86-91; CSS `global.css`
  ~509-582) renders labeled nodes joined by arbitrary rotated lines that encode no
  real topology — the worst signal for an engineer audience.
- Action (choose with the human):
  - (a) Replace with true boxes-and-arrows reflecting each system's real flow.
    Requires the human to supply the actual architecture per case study; OR
  - (b) Replace with a non-representational visual that does not imply a diagram.
- Accept: nothing on the page looks like a diagram while carrying no information.
  Keep `aria-hidden` if purely decorative; if it becomes real content, give it a
  text-accessible equivalent.

### Task 3.2 — Reconcile the hero portrait and drop Three.js overhead
- Problem: the bobbing cartoon (`AvatarScene.astro`) + arch frame read as
  playful/twee against serious infra copy, and it's the only motion on the page.
  Shipping full `three` for a decorative head is over-engineering on an engineer's
  site.
- Action (confirm choice with human): prefer a restrained real photo or an
  abstract/geometric portrait. Either way, remove the `three` dependency from the
  hot path — a CSS fallback already exists in the component (`.avatar-fallback`);
  make it the real thing, or lazy-load/replace. If `three` is removed entirely,
  drop it from `package.json`.
- Accept: hero tone matches the copy; no large 3D library loads on initial render;
  `prefers-reduced-motion` still respected.

### Task 3.3 — Break the vertical rhythm once
- Problem: Work / Capabilities / Career / Writing all repeat eyebrow → huge h2 →
  muted paragraph at the same scale; the page is elegant but flat.
- Action: introduce exactly ONE tempo change — a full-bleed section, an oversized
  pull-quote, a real image, or one section with a distinctly different layout.
  Files: `index.astro` + `global.css`.
- Accept: one section is visually distinct in scale/layout from the repeating
  pattern; the rest stay calm. Do not add a second break.

### Task 3.4 — Add one mid-scroll color landmark
- Problem: ~95% neutral means no visual anchor until the dark contact panel at the
  very bottom.
- Action: introduce one stronger color moment earlier in the scroll (a tinted
  section background, an accent block, etc.), using the existing accent tokens.
- Accept: exactly one deliberate color landmark exists above the contact panel.

### Task 3.5 — Commit to light-first; treat dark as its own design
- Problem: the warm-paper + serif concept only fully lands in light; dark is a
  mechanical inversion and the terracotta accent drifts to salmon.
- Files: `global.css` `:root` and `:root[data-theme='dark']` token blocks (~1-33).
- Action: treat light as the primary theme. Re-tune the dark palette as its own
  considered treatment (adjust accent temperature so it doesn't read salmon).
- Accept: dark theme looks intentionally designed, not inverted; accent reads
  consistent in intent across themes.

---

## 4. P2 — Refinement

### Task 4.1 — Loosen display typography
- File: `global.css` h1/h2 rules (e.g. `.profile-intro h1` ~327-334,
  `.section-heading h2` ~447-454).
- Action: raise `line-height` from `0.9` toward ~`0.95`; ease negative tracking
  slightly. Accept: large serif no longer crowds; still tight and editorial.

### Task 4.2 — Reduce monospace usage
- Problem: DM Mono carries nav, buttons, metrics, tags, captions, dates, eyebrows.
- Action: keep mono for one or two roles (recommend eyebrows + metadata); move the
  rest to the serif/sans system. Accept: mono reads as an accent, not the default.

### Task 4.3 — Fix sub-0.65rem type
- File: `global.css` `.diagram-node` (`0.62rem`), `.tag-list li` (`0.64rem`).
- Action: raise to a comfortable label minimum. Accept: no homepage label below
  ~0.7rem unless purely decorative and `aria-hidden`.

### Task 4.4 — Consolidate decorative motifs
- Problem: gridline background + orbit rings + floating dots + arch frame +
  (former) fake diagrams dilute each other.
- Action: keep ONE signature motif; remove the others. Accept: a single coherent
  decorative device across the page.

### Task 4.5 — Non-mailto contact path + nav IA
- Action: add a contact affordance that does not dead-end without a mail client
  (form or copy-to-clipboard), keeping mailto as secondary. Review nav: the
  Capabilities and Contact sections exist but aren't linked — add or deliberately
  omit. Accept: contact works without a mail client; nav reflects real sections.

---

## 5. Non-goals

- Do not add more decoration to fix flatness — the fix is ONE strong move.
- Do not lean further into the warm-serif + mono-caps + arches + orbits template.
- Do not regress accessibility, responsive behavior, grid discipline, or EN/ID
  parity.
- Do not fabricate any credibility content (emails, metrics, dates, architecture).

---

## 6. Definition of done

- All P0 tasks complete with human-provided real values.
- At least Tasks 3.1, 3.2, and one of {3.3, 3.4} complete.
- `pnpm build` passes (`astro check` clean).
- Page verified in light + dark, desktop + mobile, EN + ID.
- Success test: a senior engineer concludes within ~10s "this person builds
  serious systems and has proof," and can recall one distinctive visual detail
  afterward.
