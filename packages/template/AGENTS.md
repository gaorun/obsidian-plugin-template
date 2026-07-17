# {{PLUGIN_NAME}} — Agent Guide

This is an Obsidian community plugin built with TypeScript + Vite.

## Key files

- `src/main.ts` — Plugin entry point (class extends `Plugin`)
- `src/settings.ts` — Settings interface, defaults, and settings tab
- `manifest.json` — Plugin metadata (id, name, version, etc.)
- `vite.config.ts` — Build config (CJS output, external modules)
- `scripts/link-vault.mjs` — Symlink `dist/` into vault for development
- `scripts/clear.mjs` — Clean up dist and symlink

## Important conventions

- The plugin class is `export default class MyPlugin extends Plugin`
- Settings are loaded/saved via `this.loadData()` / `this.saveData()`
- Commands use prefixed IDs like `{{PLUGIN_ID}}-command-name`
- The `manifest.json` `id` field is used by link/clear scripts for symlink naming
- Build output is `dist/main.js` (CJS bundle via Vite)
- External modules (`obsidian`, `electron`, `@codemirror/*`) are not bundled

## Development flow

```bash
OBSIDIAN_VAULT_PATH=/path/to/vault pnpm dev   # watch + auto-link
pnpm build                                      # production build
pnpm clear                                      # clean dist + symlink
pnpm lint                                       # ESLint check
```
