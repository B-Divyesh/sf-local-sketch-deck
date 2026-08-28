# Local Sketch Deck handoff

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
`npx tsc --noEmit` also passes.

Browser smoke test (Chromium at 390 px): opened the three-card starter, added
a button, opened/closed preview, and observed no console errors. Axe reported
zero violations for the editor start screen and zero for the landing page.
The landing page’s release request currently returns an expected 404 in local
development because no GitHub Release exists yet; it falls back to the release
page. After the first tag release, it reads `latest.json` from the release asset
API and links the detected platform installer.

Performance build output: editor JS 12.84 KB (5.30 KB gzip), editor CSS 6.62
KB (2.15 KB gzip), landing JS 3.08 KB (1.47 KB gzip), landing CSS 4.40 KB
(1.51 KB gzip), and LCP illustration 58 KB WebP. These are comfortably below
the stated static budgets. Semantics include a title/lang/main/one h1, focus
states, labels, alt text, reduced-motion rules, and mobile layout.

## Known gaps / operator action

* This container lacks `glib-2.0` development headers, so local `cargo check`
  stops at the Linux system-library check; the release workflow installs the
  required WebKit/GTK bundle dependencies before building. The web app, tests,
  type-check, and production Vite build all pass locally.
* Tags `v0.1.0` and `v0.1.1` exposed workflow validation issues that were
  corrected. The current `v0.1.2` release matrix was pushed and is running;
  verify one downloaded installer against release `SHA256SUMS` and confirm
  `latest.json` links each platform after all matrix jobs complete.
* Builds are deliberately unsigned. To sign production releases, add
  `APPLE_CERTIFICATE` (plus its password/provisioning variables used by Tauri)
  and `WINDOWS_CERT_PFX` (plus password) as repository secrets, then configure
  the corresponding Tauri Action signing environment. Until then, macOS needs
  right-click → Open and Windows may show SmartScreen.
