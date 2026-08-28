# Independent verification — FAIL

**Candidate:** `29171cf829de4e01cda0e59df3421af308d04a7b`  
**Live URL:** <https://local-sketch-deck.sociobot.in>  
**Verified:** 2026-08-28 (fresh checkout)

## Verdict

**FAIL — do not release.** The required claims contract is absent and the live
first screen fails both the plain-words and one-click demo requirements. The
editor also makes some promised interactions mouse-only in preview/export.

## Release-blocking findings

### P0 — required claims contract is missing

`.factory/claims.json` does not exist. Therefore there were no declared,
tagged claim tests to run from the demo entry point. This is an explicit
release blocker under the claims contract. It also leaves live/README claims
such as local-only storage, save/reopen, standalone HTML export, no tracking,
and installer/checksum behavior without the required per-claim sandbox tests.

### P0 — live first read and demo fail

Cold live Chromium at the canonical URL shows:

* H1: “Draw a small world. Make it answer.”
* Description: “A local, visual home for the little interactive stories you
  wish you could make without opening a framework.”
* Primary action: “Download for your computer.”

This does not say in plain words what the product does and for whom (creative
learners) and gives no first action that tries the product. `Try it with sample
data` appears zero times on the page. There is no public `/demo` or `?demo=1`
entry, no demo-mode banner/reset/start-for-real control, and no
`.factory/demo.md`. The landing page also lacks the required captioned 3–5
frame desktop sample walkthrough. The app’s first-run “Open the three-card
starter” is useful, but it is behind installation and is not the required
one-click landing demo.

### P1 — preview and exported text actions are not keyboard-operable

In the shipped sample preview, two elements have behaviors (`wake-title` text
and `Follow it →` button), but only one is focusable: the button. Text
elements with show/hide/change-text actions render as non-focusable `div`s
with mouse `onclick` handlers. The same structure is emitted by exported HTML.
Thus a creator can make an interaction that keyboard-only visitors cannot
activate, contrary to the brief’s accessible text semantics and the
accessibility acceptance criteria.

### P1 — numeric position bounds are bypassable

The inspector inputs advertise X `min=0,max=95`, but entering `-100` is
accepted and renders the text at `left: -630px`. This permits content to be
placed outside the card and carried into the exported file instead of rejecting
or clamping invalid input.

## Other defects

### P2 — no real 404 route

`GET /does-not-exist` on the live site returns HTTP 200 and the landing page.
The site-structure contract requires a styled 404 route with a way back.

### P2 — required site metadata/discovery files are absent

The landing HTML has no meta description, canonical link, Open Graph/Twitter
metadata, `robots.txt`, or `sitemap.xml`. This falls short of the stated site
structure requirements.

### P2 — mobile hit targets below the 44 px requirement

At 390 px, New/Open/Save/Export measure 40 px high and Preview/Text/Button
measure 38 px high. The visual layout has no document horizontal overflow, but
these targets do not meet the 44 px acceptance threshold.

## Evidence and checks that passed

* Clean install: `npm ci` passed, with 0 audit vulnerabilities.
* Repository suite: `npm test` passed (7 tests: 3 unit, 1 build, 3 browser).
* Type check: `npx tsc --noEmit` passed. There is no configured lint script
  (`npm run lint` reports “Missing script: lint”).
* Exact production build: `npm run build` passed. Output: `dist/app` and
  `dist/site`; site JS 2.87 kB / 1.38 kB gzip, site CSS 4.40 kB / 1.51 kB
  gzip, app JS 12.84 kB / 5.30 kB gzip, app CSS 6.62 kB / 2.15 kB gzip.
  `public/hero-workbench.webp` is 58 kB. These are within the stated budgets.
* Native `cargo check --locked --manifest-path src-tauri/Cargo.toml` could not
  complete in this container because `glib-2.0.pc` / Linux GTK development
  packages are absent. This is an environment limitation; the published
  v0.1.3 release is from an ancestor of the candidate and contains native
  artifacts. It does not change this FAIL verdict.
* End-to-end local app, built output: loaded the three-card sample; pointer
  testing changed text, hid text, navigated cards, and revealed hidden text;
  saved a valid 2,705-byte `.sketchdeck`; exported a standalone 3,778-byte
  HTML file. It made no external requests. Invalid JSON produced the recovery
  message “That file is not a Local Sketch Deck project.” A 2,000,001-byte
  image was rejected with the documented under-2-MB message.
* Accessibility smoke/axe: local app start/studio and live landing, privacy,
  and terms had zero axe serious/critical findings. Live desktop and 390 px
  mobile had no console/page errors and no document horizontal overflow.
  Visible gold focus styling and reduced-motion CSS are present.
* Privacy/network: a fresh live landing load requested only same-origin assets
  plus `https://api.github.com` for release metadata; no analytics/tracker or
  third-party font/CDN request was observed. The deployed CSP restricts
  scripts/styles/images to self and allows connections only to self, GitHub
  API, and Sociobot API; HSTS, nosniff, referrer policy, and immutable hashed
  asset caching are present.
* Rate limiting: `GET /api/v1/products/local-sketch-deck/verify` with an
  invalid token returned the expected 200 invalid verdict. A 40-request burst
  at concurrency 20 produced 29 HTTP 200 and 11 HTTP 429 results; 429
  responses carried `Retry-After: 2` or `3`. The observed limit began during
  that burst after roughly 29 accepted requests.
* Deployment match: SHA-256 matched fresh candidate build output for deployed
  `assets/index-CHKGs6HN.js`, `assets/style-BtHEtV8I.css`, and
  `hero-workbench.webp`. Live `/privacy` and `/terms` return 200. The current
  v0.1.3 desktop release targets ancestor `4949a5a`, which is an ancestor of
  this documentation-only candidate.

## Required remediation before re-verification

1. Add `.factory/claims.json`; add and run one clean-demo observable test per
   visitor-facing claim, including privacy and any offline/export promise.
2. Add the required public demo entry and first-screen `Try it with sample
   data` path, isolated demo storage/banner/reset/start-for-real behavior,
   `.factory/demo.md`, and the desktop walkthrough.
3. Rewrite the first screen in plain words: job, named audience, and the
   immediate first action.
4. Make every behavior trigger keyboard-operable in preview and exported HTML;
   validate/clamp coordinate input before rendering/exporting.
5. Supply the real 404, metadata/discovery files, and 44 px mobile controls.
