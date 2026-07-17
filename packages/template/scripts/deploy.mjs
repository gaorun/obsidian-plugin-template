#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Read plugin info from manifest.json
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const pluginId = manifest.id;

// Get vault path from Obsidian CLI
let vaultPath;
try {
	const raw = execSync('obsidian vault', { encoding: 'utf8' });
	const match = raw.match(/^path\t(.+)$/m);
	vaultPath = match ? match[1].trim() : '';
	if (!vaultPath) throw new Error('empty vault path');
} catch {
	console.log(`[deploy] Could not detect Obsidian vault path.
  Make sure the Obsidian CLI is installed and the current directory is inside a vault.
  You can also set the vault path manually via: export OBSIDIAN_VAULT_PATH=/path/to/your/vault`);
	process.exit(0);
}

const targetDir = resolve(vaultPath, '.obsidian', 'plugins', pluginId);
const distPath = resolve(process.cwd(), 'dist');

if (!existsSync(distPath)) {
	console.log(`[deploy] dist/ not found. Run "npm run build" first.`);
	process.exit(0);
}

// Remove old plugin directory and copy new one
if (existsSync(targetDir)) {
	execSync(`rm -rf "${targetDir}"`, { stdio: 'pipe' });
}
execSync(`mkdir -p "${resolve(targetDir, '..')}"`, { stdio: 'pipe' });
execSync(`cp -r "${distPath}" "${targetDir}"`, { stdio: 'pipe' });
console.log(`[deploy] Copied dist/ to ${targetDir}`);

// Copy manifest.json and styles.css alongside main.js
if (existsSync('manifest.json')) {
	execSync(`cp manifest.json "${targetDir}/"`, { stdio: 'pipe' });
}
if (existsSync('styles.css')) {
	execSync(`cp styles.css "${targetDir}/"`, { stdio: 'pipe' });
}
console.log(`[deploy] Copied manifest.json and styles.css`);

// Attempt to enable the plugin via Obsidian CLI
try {
	execSync(`obsidian plugin:enable ${pluginId}`, { stdio: 'pipe' });
	console.log(`[deploy] Enabled plugin: ${pluginId}`);
} catch {
	console.log(`[deploy] Could not auto-enable plugin. Enable it manually in Obsidian settings.`);
}
