# {{PLUGIN_NAME}}

{{DESCRIPTION}}

## Prerequisites

- [Obsidian](https://obsidian.md/) v1.0.0+
- [pnpm](https://pnpm.io/) (recommended) or npm

## Quick Start

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Development mode (auto-links to vault if OBSIDIAN_VAULT_PATH is set)
OBSIDIAN_VAULT_PATH=/path/to/your/vault pnpm dev
```

## Development

The `dev` script builds the plugin in watch mode and creates a symlink from your vault's `.obsidian/plugins/{{PLUGIN_ID}}-dist/` to the `dist/` directory. Set the `OBSIDIAN_VAULT_PATH` environment variable to enable auto-linking:

```bash
export OBSIDIAN_VAULT_PATH=/path/to/your/vault
pnpm dev
```

### Scripts

| Script  | Description                                    |
| ------- | ---------------------------------------------- |
| `build` | Type-check then build for production           |
| `dev`   | Watch mode build with vault symlink            |
| `link`  | Create/recreate vault symlink                  |
| `clear` | Remove vault symlink and dist directory        |
| `lint`  | Run ESLint                                     |
| `version` | Bump version in manifest.json and versions.json |

## Plugin Structure

```
.
├── dist/               # Build output
├── scripts/
│   ├── link-vault.mjs  # Create vault symlink
│   └── clear.mjs       # Clean up
├── src/
│   ├── main.ts         # Plugin entry point
│   └── settings.ts     # Settings and settings tab
├── manifest.json       # Plugin manifest
├── styles.css          # Plugin styles
├── vite.config.ts      # Build configuration
└── tsconfig.json       # TypeScript configuration
```

## License

0-BSD
