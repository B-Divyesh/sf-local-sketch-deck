# Local Sketch Deck visual thesis

## Direction — signal-lit pixel workshop

Local Sketch Deck uses a **pixel/demoscene language**: the warm, deliberate
glow of a tiny CRT workbench rather than the nostalgia of a fake 1980s UI.
Creative learners are making small stories by directly placing things and
giving them plain-language behaviours, so the interface makes every object
feel like a luminous, editable signal block. A dark single-mode workspace
reduces screen glare and lets artwork be the brightest thing on screen.

## System

* **Palette:** void `#111221`, panel `#1c1e35`, raised `#282b4c`, paper
  `#fff6df`, ink `#151629`, muted `#b7b5c9`, cyan signal `#77f7e4`, coral
  action `#ff7a8a`, gold focus `#ffd166`, success `#9be564`, danger `#ff8c9c`.
  Paper/ink is used inside cards to guarantee readable exported content;
  interface copy meets 4.5:1 against its surface.
* **Type:** system monospace (`ui-monospace`, SFMono-Regular, Consolas) for
  compact labels and inspectable actions; system rounded sans for prose and
  fields. This avoids network font requests while retaining a practical
  desktop-tool texture.
* **Spacing:** 4 px base unit; 8/12/16/24/32 are the visible intervals.
  Components have crisp 2 px outlines, 6 px shadows, and 8 px radii: a
  contemporary interpretation of pixels, not a skeuomorphic computer.
* **Interaction grammar:** select creates a gold outline; direct manipulation
  uses a crosshair cursor and labelled inspector controls; the stage preview
  is separate from editing. “Signal” labels identify action targets without
  hiding the behaviour in code.
* **Motion:** 160 ms opacity/transform transitions communicate selection and
  view changes. Under reduced motion, transitions are disabled and the stage
  changes instantly. No looping animation or flashing effect is used.

## Original illustration prompt sheet

**World:** an after-hours creative workbench in a dark indigo room, assembling
a small interactive story from glowing pixel cards. **Materials:** CRT bloom,
soft dither, chunky matte plastic, graph-paper grain. **Light:** cyan and
coral emissive card edges with gentle warm lamp glow. **Lens:** clean isometric
editorial product illustration, wide negative space. **Avoid:** text,
watermarks, logos, real people, brands, copyrighted characters, UI screenshots.

Asset `public/hero-workbench.webp` is generated with the factory Azure image
model on 2026-08-28. Prompt: “Original isometric pixel-art illustration of a
small creative workbench in a deep indigo room, three blank glowing story
cards floating above a desk, cyan and coral CRT bloom, matte plastic controls,
subtle dithering and graph-paper grain, contemporary demoscene aesthetic,
wide composition, no text, no watermark, no logos, no people, no brands.”
It is an original generated product asset, reviewed for artifacts and converted
to WebP for the landing page.

Small functional icons are authored as inline SVG/CSS, not generated imagery.
The application icon at `assets/src/app-icon.svg` is hand-authored for this
product from the signal-card grid motif and the documented cyan/coral/gold
palette; Tauri-generated platform renditions live in `src-tauri/icons/`.
