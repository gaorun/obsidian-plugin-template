# Obsidian Plugin Template

Scaffold, develop, and publish Obsidian plugins — in minutes, not hours.

Have a great idea for an Obsidian plugin but don't want to spend hours setting up the build toolchain, configuring TypeScript, and wiring up the vault integration? This project gives you a **zero-config CLI** that generates a production-ready plugin project with TypeScript, Vite 8, ESLint, and one-command hot-reload development — so you can focus on writing code, not config files.

> **中文版** → [README.zh-CN.md](./README.zh-CN.md)

## What's Inside

| Package                                             | Description                                                            |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| [`@gaorun/create-obsidian-plugin`](./packages/cli/) | Scaffolding CLI — answers a few prompts, gets a working plugin project |
| [`packages/template/`](./packages/template/)        | The template that powers the CLI (not meant to be used directly)       |

---

## Quick Start

### Prerequisites

- **Node.js** >= 22.13
- **pnpm** >= 9
- **Obsidian CLI** — Bundled with the Obsidian desktop app (`/usr/local/bin/obsidian`).
  Install [Obsidian](https://obsidian.md) and the CLI will be available automatically.

### Registry Setup

This package is published to GitHub Packages. Add the following to `~/.npmrc`:

```ini
@gaorun:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxx
```

Replace `ghp_xxxxxxxxxxxx` with a GitHub token that has `read:packages` scope ([create one here](https://github.com/settings/tokens)).

### Scaffold a Plugin

```bash
npx --registry https://npm.pkg.github.com @gaorun/create-obsidian-plugin@latest
```

You'll be prompted for:

1. **Plugin name** — e.g. `My Todoist Sync`
2. **Description** — what your plugin does
3. **Author** — your name (defaults from `git config`)
4. **Author email** — your email (defaults from `git config`)

The plugin ID is automatically generated as kebab-case of the name. The project is created in a new directory under your current folder.

> **Skip the prompts** with CLI flags:
>
> ```bash
> npx --registry https://npm.pkg.github.com @gaorun/create-obsidian-plugin@latest \
>   --name "My Plugin" \
>   --description "Does something useful" \
>   --author "Jane Doe" \
>   --email "jane@example.com"
> ```

---

## Development Workflow

```bash
cd my-plugin
pnpm run dev
```

This starts Vite in watch mode. Every time you save a source file:

1. Vite rebuilds to `dist/`
2. The plugin is **automatically copied** to your Obsidian vault
3. Obsidian **hot-reloads** the plugin — no manual refresh needed

### Other Commands

| Command            | What it does                                               |
| ------------------ | ---------------------------------------------------------- |
| `pnpm run build`   | Production build (minified, no sourcemap) → `dist/main.js` |
| `pnpm run deploy`  | Copy current `dist/` to vault plugins directory            |
| `pnpm run clear`   | Remove plugin from vault, delete local `dist/`             |
| `pnpm run lint`    | Run ESLint with Obsidian-specific rules                    |
| `pnpm run version` | Sync version across `manifest.json` and `versions.json`    |

---

## Project Structure

```
my-plugin/
├── src/
│   ├── main.ts              # Plugin entry point — add commands, events, settings here
│   └── settings.ts          # Settings interface and settings tab UI
├── scripts/
│   ├── deploy.mjs           # Copies build output to vault
│   └── clear.mjs            # Removes plugin from vault
├── manifest.json            # Plugin metadata (id, name, version, author)
├── vite.config.ts           # Build config + auto-deploy plugin
├── eslint.config.mts        # Obsidian-specific ESLint rules
├── tsconfig.json            # TypeScript config (ESNext, bundler resolution)
└── styles.css               # Plugin styles (optional)
```

---

## Releasing a Plugin

1. Update `version` in `manifest.json`
2. Run `pnpm run version` to sync `versions.json`
3. Run `pnpm run build` to verify the production build
4. Commit and push to GitHub
5. Create a GitHub release with the version as the tag (no `v` prefix)
6. Attach `main.js`, `manifest.json`, and `styles.css`
7. (Optional) [Submit to the community plugin list](https://github.com/obsidianmd/obsidian-releases)

---

## For AI Agents

An [AI Agent Guide](https://gaorun.github.io/obsidian-plugin-template/AI-GUIDE) is available with step-by-step instructions designed for AI coding assistants to scaffold, develop, and publish an Obsidian plugin end-to-end.

---

## Requirements

| Tool         | Version                           |
| ------------ | --------------------------------- |
| Node.js      | >= 22.13                          |
| pnpm         | >= 11.x                           |
| Obsidian CLI | latest (bundled with desktop app) |
