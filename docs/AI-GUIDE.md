# Obsidian Plugin Creation Guide (for AI Agents)

This guide helps AI agents scaffold, develop, and publish an Obsidian plugin using the `@gaorun/create-obsidian-plugin` CLI tool and its bundled template.

---

## Overview

The CLI creates a fully functional Obsidian plugin project with:

- **TypeScript** source code in `src/`
- **Vite 8** build with Oxc minification (output: `dist/main.js` as CJS)
- **ESLint** preconfigured with Obsidian-specific rules
- **Development workflow** that auto-deploys to your Obsidian vault
- **Scaffold flow**: clone template → replace placeholders → install dependencies

---

## Prerequisites

| Requirement  | Version  | Check command             |
| ------------ | -------- | ------------------------- |
| Node.js      | >= 22.13 | `node --version`          |
| pnpm         | >= 9     | `pnpm --version`          |
| Git          | any      | `git --version`           |
| Obsidian CLI | latest   | `npm install -g obsidian` |

---

## Step 1: Scaffold a New Plugin

> **Registry setup**: This package is published to GitHub Packages, not the public npm registry.
> You need to configure npm/pnpm to resolve `@gaorun/*` packages from GitHub Packages:
>
> ```bash
> echo "@gaorun:registry=https://npm.pkg.github.com/" >> ~/.npmrc
> ```
>
> If you don't have a GitHub token with `read:packages` scope, create one at
> https://github.com/settings/tokens and add it to `~/.npmrc`:
>
> ```bash
> echo "//npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxx" >> ~/.npmrc
> ```

Run the CLI using `npx` (no install needed):

```bash
npx @gaorun/create-obsidian-plugin@latest
```

The CLI will ask:

1. **Plugin name** — human-readable name (e.g. `My Todoist Sync`)
2. **Description** — short description of what the plugin does
3. **Author** — your name (defaults from `git config user.name`)
4. **Author email** — your email (defaults from `git config user.email`)

> The **plugin ID** is automatically derived from the name using kebab-case (e.g. `my-todoist-sync`). You can override it with `--id` if needed.

The project is created in a new directory named after the plugin ID under your current working directory.

### CLI Arguments (skip interactive prompts)

```bash
npx @gaorun/create-obsidian-plugin@latest \
  --name "My Todoist Sync" \
  --description "Syncs tasks between Obsidian and Todoist" \
  --author "Jane Doe" \
  --email "jane@example.com"
```

---

## Step 2: Project Structure

After scaffolding, the project looks like this:

```
my-todoist-sync/
├── .editorconfig
├── .gitignore
├── .npmrc                      # Registry locked to npmjs.org
├── AGENTS.md                   # Agent instructions for this project
├── eslint.config.mts           # ESLint config with obsidianmd plugin
├── LICENSE                     # 0-BSD license
├── manifest.json               # Obsidian plugin manifest
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml
├── README.md                   # Plugin documentation (fill me in!)
├── tsconfig.json               # TypeScript config
├── version-bump.mjs            # Version bump helper
├── versions.json               # Version compatibility mapping
├── styles.css                  # Plugin styles (optional)
├── vite.config.ts              # Vite build + deploy-to-vault plugin
├── scripts/
│   ├── deploy.mjs              # Copy dist/ to vault plugins dir
│   └── clear.mjs               # Remove plugin from vault and local dist
└── src/
    ├── main.ts                 # Plugin entry point (main class)
    └── settings.ts             # Settings interface and settings tab
```

### Key Files

| File                 | Purpose                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `manifest.json`      | Plugin metadata: id, name, version, author, description                                    |
| `src/main.ts`        | Main plugin class extending `Plugin`. Register commands, events, settings                  |
| `src/settings.ts`    | Settings interface, defaults, and settings tab UI                                          |
| `vite.config.ts`     | Build config + `deploy-to-vault` plugin that auto-copies to vault after each dev build     |
| `scripts/deploy.mjs` | Copies `dist/` + `manifest.json` + `styles.css` to `{vault}/.obsidian/plugins/{pluginId}/` |

---

## Step 3: Development Workflow

### Start development (watch mode)

```bash
cd my-todoist-sync
pnpm run dev
```

This does three things:

1. **Builds** the plugin with Vite in watch mode (recompiles on every file change)
2. **Deploys** to your Obsidian vault automatically after each build (via Vite's `closeBundle` plugin hook)
3. **Enables** the plugin in Obsidian (if `obsidian plugin:enable` succeeds)

Every time you save a source file, Vite rebuilds and the vault copy is updated automatically.

> **Note**: Obsidian loads plugins on startup. After the first deploy, reload Obsidian (Cmd+R / Ctrl+R) to see your plugin. For subsequent changes during the same session, the vault copy is updated but Obsidian still needs a reload to pick up changes.

### Production build

```bash
pnpm run build
```

Output: `dist/main.js` (minified, no sourcemap).

### Manual deploy

```bash
pnpm run deploy
```

Copies the current `dist/` to the vault. Useful if you ran a production build and want to test it.

### Clean up

```bash
pnpm run clear
```

Removes the plugin from the vault plugins directory and deletes the local `dist/` folder.

---

## Step 4: Modify the Plugin

### 4.1 Plugin Entry Point (`src/main.ts`)

The default template demonstrates the Obsidian Plugin API:

```typescript
export default class MyPlugin extends Plugin {
	settings!: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// Add a ribbon icon
		this.addRibbonIcon('dice', 'My Plugin', () => {
			new Notice('Hello!');
		});

		// Add a command
		this.addCommand({
			id: 'my-plugin-do-something',
			name: 'Do something',
			callback: () => {
				/* ... */
			},
		});

		// Add settings tab
		this.addSettingTab(new MySettingTab(this.app, this));
	}

	onunload() {
		/* cleanup */
	}
}
```

#### Common tasks to implement:

- **Add a ribbon icon**: `this.addRibbonIcon(iconName, tooltip, callback)`
- **Add a command**: `this.addCommand({ id, name, callback })`
- **Add an editor command**: `this.addCommand({ id, name, editorCallback })`
- **Register a DOM event**: `this.registerDomEvent(element, event, handler)`
- **Register an interval**: `this.registerInterval(window.setInterval(...))`

### 4.2 Settings (`src/settings.ts`)

```typescript
export interface MyPluginSettings {
	apiKey: string;
	syncInterval: number;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	apiKey: '',
	syncInterval: 5,
};
```

Load and save settings:

```typescript
async loadSettings() {
    this.settings = Object.assign(
        {},
        DEFAULT_SETTINGS,
        await this.loadData()
    );
}

async saveSettings() {
    await this.saveData(this.settings);
}
```

### 4.3 Plugin Manifest (`manifest.json`)

```json
{
	"id": "my-todoist-sync",
	"name": "My Todoist Sync",
	"version": "1.0.0",
	"minAppVersion": "1.0.0",
	"description": "Syncs tasks between Obsidian and Todoist",
	"author": "Jane Doe",
	"isDesktopOnly": false
}
```

| Field           | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `id`            | Unique plugin ID (kebab-case). Used as vault directory name |
| `name`          | Display name in Obsidian settings                           |
| `version`       | [SemVer](https://semver.org/) version for releases          |
| `minAppVersion` | Minimum Obsidian version required                           |
| `author`        | Your name                                                   |
| `authorUrl`     | Optional: link to your website/GitHub                       |
| `fundingUrl`    | Optional: link for community funding                        |
| `isDesktopOnly` | `false` if mobile-compatible                                |

---

## Step 5: Testing in Obsidian

After running `pnpm run dev`:

1. Open Obsidian
2. Go to **Settings → Community plugins**
3. Turn off **Safe mode** if needed
4. Under **Installed plugins**, find your plugin by name
5. Toggle the switch to enable it

The plugin's `manifest.json`, `main.js`, and `styles.css` are already deployed to `{vault}/.obsidian/plugins/{pluginId}/`.

To reload after code changes:

- **Mac**: `Cmd + R`
- **Windows/Linux**: `Ctrl + R`

---

## Step 6: Version Bump & Release

### Bump version

```bash
# Update manifest.json version manually, then run:
pnpm run version
```

This updates `manifest.json` and `versions.json` with the new version.

### Release checklist

1. Bump version in `manifest.json`
2. Run `pnpm run version` to sync `versions.json`
3. Run `pnpm run build` to verify production build
4. Commit and push to GitHub
5. Create a GitHub release with tag `{version}` (no `v` prefix)
6. Attach `main.js`, `manifest.json`, and `styles.css` to the release
7. (Optional) Submit to the [community plugin list](https://github.com/obsidianmd/obsidian-releases)

---

## Appendix: CLI Reference

```bash
npx @gaorun/create-obsidian-plugin [options]

Options:
  -n, --name <name>          Plugin name (default: My Plugin)
  -i, --id <id>             Plugin ID (auto: kebab-case of name)
  -d, --description <desc>  Plugin description
  -a, --author <author>     Author name (default: from git config)
  -e, --email <email>       Author email (default: from git config)
  -h, --help                Show this help message
```

## Appendix: Useful Obsidian API References

- [Obsidian Plugin API Docs](https://docs.obsidian.md)
- [Obsidian Plugin Guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Obsidian ESLint Plugin](https://github.com/obsidianmd/eslint-plugin)
- [Obsidian Icon List](https://docs.obsidian.md/Reference/icons)
