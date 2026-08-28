# Local Sketch Deck

Local Sketch Deck is a small, local-first desktop workshop for creative learners
who want to draw an interactive card, give it one visible behaviour, and keep
the result as an ordinary file. It is for tiny stories, sketches, and playful
prototypes—not a web framework or game engine.

You can add text, buttons, and images to cards; connect them with **show**,
**hide**, **change text**, **play sound**, and **go to card** actions; save a
portable `.sketchdeck` JSON project; reopen it; and export a standalone HTML
file. No account, tracking, cloud sync, or runtime CDN is used.

## Run it

Requires Node 22+ and Rust only when building the desktop application.

```sh
npm install
npm run dev          # editor at http://localhost:5173
npm test
npm run build        # editor -> dist/app, landing site -> dist/site
```

For a native desktop development window:

```sh
npm run tauri dev
```

`npm run build:site` creates the static deployment site in `dist/site` with its
`index.html` at that root. `npm run build:app` creates the Tauri webview assets
in `dist/app`.

## Files and safety

Saving downloads a new file and therefore never silently overwrites a project.
Opening accepts only the documented v1 JSON shape. Images are embedded into the
project to keep projects movable; keep each image under 2 MB. Exported HTML has
only the five bounded client-side actions and never evaluates project code.

## Installers and release

Tag `v0.1.0` (or a later `v*`) to run the GitHub Actions release matrix. It
creates unsigned macOS, Windows, and Linux packages, releases checksums, and
publishes `latest.json` for the landing page. macOS may require right-click →
Open and Windows may show SmartScreen because signing certificates are not
included.

On a deployed landing site:

```sh
curl -fsSL https://local-sketch-deck.sociobot.in/install.sh | sh
irm https://local-sketch-deck.sociobot.in/install.ps1 | iex
```

Both scripts download `SHA256SUMS` and verify an installer before opening it.

## Supporter license

The free editor and export are permanent. An optional $19 one-time supporter
license unlocks future extra starter-deck/creative packs through Sociobot’s
hosted checkout. License storage and daily verification are implemented on the
landing site; no payment provider is embedded in this project. See the deployed
`/privacy.html` and `/terms.html` pages.

## License

[MIT](LICENSE)
