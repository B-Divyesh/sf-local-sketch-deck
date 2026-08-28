# Local Sketch Deck repair handoff

## Repair summary

Candidate `3ad1d404bf20c5bf382f449b9b5751ac52e80c95` reproduced a false-success
production build: `npm ci && npm run build` wrote the landing page to
`site/dist/site/index.html`, leaving the declared deploy root
`dist/site/index.html` missing. `vite.site.config.ts` now anchors the site root,
public directory, and output directory to the config file instead of resolving
the CLI `--outDir` relative to `site/`. The production build now emits the
landing page, privacy and terms pages, and all referenced assets under
`dist/site`, after the desktop webview build finishes.

`test/build-output.test.ts` prevents recurrence by deleting both possible output
trees, running the literal `npm run build`, asserting `dist/site/index.html`,
checking every local stylesheet/script/image reference, checking privacy/terms,
checking the desktop webview output, and rejecting the former nested output.

The failed `v0.1.2` Actions logs also exposed missing Tauri platform icons as the
reason all four native package jobs failed. A hand-authored, product-specific
source icon and Tauri-generated `.png`, `.ico`, and `.icns` renditions now make
the existing macOS arm64/x64, Windows, and Linux release matrix packageable.

## What shipped

* A Tauri 2 + Vite TypeScript desktop app with a real local card workflow:
  start blank or from a three-card story, add editable text/buttons/images,
  inspect all five bounded actions, preview, save/reopen ordinary `.sketchdeck`
  JSON, and export a standalone interactive HTML file.
* A responsive pixel/demoscene landing site at `dist/site`, with detected-OS
  release download handling, privacy/terms pages, checksum-verifying installer
  scripts, and one-time $19 Sociobot supporter-license restore/verification.
* GitHub Actions release matrix for macOS arm64/x64, Windows, and Linux. It
  releases bundles through Tauri Action, then produces a cross-platform
  `SHA256SUMS` and `latest.json` release manifest.
* Design system and asset provenance in `.factory/design.md`. The reviewed,
  original Azure-generated workbench illustration is kept at
  `assets/src/hero-workbench.png` with its prompt sidecar; the shipped WebP is
  `public/hero-workbench.webp` (58 KB).

## Run and verify

```sh
npm ci
npm test
npm run build
```

Build output: editor `dist/app`; static landing deploy root `dist/site`.

Local repair evidence on 2026-08-28:

* `npm ci && npm run build` — passed; `dist/site/index.html` present and
  `site/dist` absent.
* `npm test` — 7/7 passed: 3 unit, 1 clean exact-build regression, and 3
  Playwright browser scenarios.
* `npx tsc --noEmit` and `sh -n public/install.sh` — passed.
* Chromium at 1280×850 and 390×844 — editor starter/add/preview flow passed by
  keyboard; landing OS detection and release-manifest update passed; no page or
  console errors; no horizontal mobile overflow.
* Axe — zero serious or critical findings on the editor start/studio and the
  landing, privacy, and terms pages.
* Offline/update/privacy — failed release fetch retained the usable GitHub
  fallback; reduced-motion behavior passed; first-party load contacted only the
  declared GitHub Releases API and no analytics/tracker.

The landing page reads GitHub's CORS-enabled latest-release API and links the
detected platform installer. The workflow also publishes the required machine
manifest at
`https://github.com/B-Divyesh/sf-local-sketch-deck/releases/latest/download/latest.json`.
(GitHub's direct release-download host omits browser CORS headers, so it cannot
be parsed directly by a static-site client.) The shell installer selects the
matching macOS CPU architecture and uses the checksum tool available on Linux
or macOS.

Performance build output: editor JS 12.84 KB (5.30 KB gzip), editor CSS 6.62
KB (2.15 KB gzip), landing JS 2.75 KB (1.32 KB gzip), landing CSS 4.40 KB
(1.51 KB gzip), and LCP illustration 58 KB WebP. These are comfortably below
the stated static budgets. Semantics include a title/lang/main/one h1, focus
states, labels, alt text, reduced-motion rules, and mobile layout.

## Release and deployment evidence

* Release: `v0.1.3` at
  `https://github.com/B-Divyesh/sf-local-sketch-deck/releases/tag/v0.1.3`.
  Actions run `33156420772` completed successfully: verification, Windows,
  Linux, both macOS architectures, and manifest jobs all passed.
* Published installers: macOS arm64/x64 `.dmg`, Windows `.msi` and `.exe`, and
  Linux `.AppImage`, `.deb`, and `.rpm`. `latest.json` parses as version
  `v0.1.3` with non-empty macOS/Windows/Linux URLs; `SHA256SUMS` contains the six
  required `.dmg`/`.msi`/`.exe`/`.AppImage`/`.deb` installer entries.
* Downloaded `Local.Sketch.Deck_0.1.0_x64-setup.exe` from the release and
  verified it successfully with the published SHA-256 entry.
* Static deployment `cb6ee6b2-e3ea-474b-8079-a80e03aaf7a6` succeeded in Azure
  Static Web Apps (`centralus`), with the canonical custom domain and managed
  TLS ready at `https://local-sketch-deck.sociobot.in`.
* The factory live verifier returned HTTP 200, a matching Local Sketch Deck
  title, `lang="en"`, one h1, a main landmark, complete image alt text, and zero
  console/page errors. Live mobile Chromium resolved the Linux button to the
  real `v0.1.3` AppImage, had no horizontal overflow, and had zero serious or
  critical axe findings.
* Lighthouse 12.8.2 mobile: performance 100, accessibility 100, best practices
  100, SEO 91, LCP 1,057 ms, CLS 0, total transfer 84,283 bytes, and no console
  errors.

## Known gaps / operator action

* Local `cargo check --locked` stops at `glib-2.0` discovery because this worker
  does not contain the Linux desktop development packages. GitHub Actions
  installs WebKitGTK, AppIndicator, librsvg, and patchelf; its Linux native
  bundle completed successfully.
* Builds are deliberately unsigned. To sign production releases, add
  `APPLE_CERTIFICATE` (plus its password/provisioning variables used by Tauri)
  and `WINDOWS_CERT_PFX` (plus password) as repository secrets, then configure
  the corresponding Tauri Action signing environment. Until then, macOS needs
  right-click → Open and Windows may show SmartScreen.
