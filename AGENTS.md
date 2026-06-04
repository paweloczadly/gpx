# AGENTS.md

## Project snapshot
- This repository hosts a static web app that lists GPX tracks and allows direct download.
- Frontend stack: plain HTML, CSS, and JavaScript modules.
- GPX metadata is inferred from file names in `gpx/` using the format `YYYY-MM-DD-name.gpx`.
- Tests use the built-in Node.js test runner (`node --test`).
- Deployment target is GitHub Pages.

## Key files and folders
- `index.html`: app shell and layout.
- `app.js`: GitHub API fetch logic, filtering, rendering.
- `gpx-utils.js`: parsing and filtering utilities.
- `styles.css`: UI styles.
- `gpx/`: source GPX files.
- `tests/gpx-utils.test.js`: utility tests.
- `.github/workflows/ci.yml`: Conventional Commits + test execution on pull requests.
- `.github/workflows/cd.yml`: GitHub Pages deployment from `main`.

## Local development workflow
- Install dependencies: `npm install`
- Run local preview server: `npm run dev`
- Run tests: `npm test`

## CI/CD behavior
- CI runs on pull requests to `main`.
- CI checks commit messages and runs unit tests.
- CD runs on push to `main` (and manual dispatch), then deploys only required static files for Pages:
	`index.html`, `app.js`, `gpx-utils.js`, `styles.css`, and optional `CNAME`.

## Agent guidance for edits
- Prefer minimum effort and maximum value: choose the smallest change that solves the problem while following best practices.
- Keep the project static; do not introduce frameworks or bundlers unless explicitly requested.
- Preserve GPX naming validation assumptions in parsing logic and docs.
- When changing user-visible behavior, update tests in `tests/gpx-utils.test.js` where applicable.
- Keep documentation aligned with real workflows (`README.md`, `FAQ.md`, `CONTRIBUTING.md`).

## Documentation style
- Prefer concise, practical instructions.
- Keep examples copy-paste ready.
- Use consistent terminology: "GPX tracks", "GitHub Pages", "Conventional Commits".
