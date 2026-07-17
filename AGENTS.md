# Obsidian plugin template monorepo

## Structure

This is a **pnpm workspace monorepo**. All packages live under `packages/`.

- `packages/template/` — Obsidian community plugin template (TypeScript → bundled JS)
- `packages/cli/` — `@gaorun/create-obsidian-plugin` CLI scaffolding tool

## Tooling

- **Package manager**: pnpm (workspace-enabled).
- **Build**: Vite (configured per package via `vite.config.ts`).
- **Lint**: ESLint + `eslint-plugin-obsidianmd` (per package).
- **Format**: Prettier at root level.

## Commands

```bash
pnpm install         # install all workspace dependencies
pnpm build           # build all packages
pnpm -r lint         # lint all packages
pnpm format          # format check all source files (root)
```

## Conventions

- Each package is self-contained with its own `package.json`, `tsconfig.json`, and build config.
- Workspace root `package.json` is `"private": true` and only holds shared devDependencies (e.g. prettier).
- Use `@gaorun/` npm scope for packages published under GitHub Packages.
