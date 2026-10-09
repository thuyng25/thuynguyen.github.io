# Thuy Nguyen's portfolio

A personal portfolio with a warm paper palette, a letter-style introduction, selected projects, background, and a small optional game. Built with plain HTML, CSS, and JavaScript for GitHub Pages. No installation or build step is needed.

## Put this version on GitHub Pages

1. Open the `thuyng25/thuynguyen.github.io` repository on GitHub.
2. Choose **Add file → Upload files**.
3. Upload the **contents** of this folder into the repository root, preserving the `assets` folder. Replace the existing `index.html` and `README.md`.
4. Commit the upload. If Pages is already configured to publish this branch's root folder, it will deploy automatically. Otherwise, select that source in **Settings → Pages**.

Upload all of these together:

```text
index.html
styles.css
app.js
game.js
projects.json
assets/landscape.svg
assets/favicon.svg
Nguyen_Res_Da.pdf
README.md
```

The address remains https://thuyng25.github.io/thuynguyen.github.io/. All local file paths are relative, so this also works if the repository is renamed for a shorter Pages address.

## Edit the site

| File | What to change |
| --- | --- |
| `index.html` | Intro, background, skills, contact, resume links, and static project fallback |
| `styles.css` | Palette, spacing, typography, and responsive layouts |
| `projects.json` | Project titles, summaries, tools, links, and expandable notes |
| `app.js` | Menu, reading indicator, project filters, and copy-email button |
| `game.js` | Game difficulty, timers, pause/resume, and best-score storage |
| `assets/landscape.svg` | Cover illustration |
| `Nguyen_Res_Da.pdf` | Resume; keep this filename or update the links in `index.html` |

Project categories are `data`, `web`, and `research`, matching the filter buttons. On a hosted site, project cards load from `projects.json`. The HTML also includes a copy of the projects for direct file previews and visitors without JavaScript. If project content changes, update that fallback as well to keep both versions consistent.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Opening `index.html` directly also works with the static project fallback, but browsers will not load JSON via `file://`.

## Interactions and accessibility

- Responsive mobile menu, current-section navigation, and reading progress.
- Category filters and native expandable project notes.
- Keyboard focus styles, a skip link, and reduced-motion support.
- Email link, copy-email feedback on supported secure pages, and working resume links.
- Optional game with pause/resume, automatic pause when hidden or out of view, and best-score storage in this browser.
- No external fonts, libraries, tracking, or backend services. Essential content remains readable without JavaScript.

The outlier game is a visual color-comparison activity; all dots have keyboard-accessible buttons, but it does not provide an equivalent nonvisual game.
