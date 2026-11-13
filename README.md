# Studio template: Tauri

The starter Universal App Studio copies when someone picks **Tauri** while setting up a new project.

It's the official Tauri 2 starter (`npm create tauri-app@latest`, React and TypeScript). You need Rust installed too: https://v2.tauri.app/start/prerequisites/. It has one change: **the look comes from `design/tokens.json`**.

- `design/tokens.json` holds the colours, fonts, corners and spacing. Studio replaces it with the project's own design straight after copying this template.
- `design/adapters/` reads those tokens in this stack's own language. See `design/adapters/README.md` once Studio has added it, or the comments at the top of each adapter.
- Style everything from the tokens. Change the look in Studio, never by typing colours into the code.

## Running it

```
npm install
npm run tauri dev
```

Open the app window that opens.

## Checks

```
npm run build
npm run tauri build -- --no-bundle
npm test
```

The same checks run on GitHub for every push and pull request (`.github/workflows/checks.yml`).
