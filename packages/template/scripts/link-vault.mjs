#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, symlinkSync, unlinkSync } from 'fs';
import { resolve } from 'path';

// Read plugin info from manifest.json
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const pluginId = manifest.id;

const vaultPath = process.env.OBSIDIAN_VAULT_PATH;

if (!vaultPath) {
	console.log(`[link-vault] OBSIDIAN_VAULT_PATH not set. Skip linking.
  To enable auto-linking, run: export OBSIDIAN_VAULT_PATH=/path/to/your/vault`);
	process.exit(0);
}

const vaultPluginsDir = resolve(vaultPath, '.obsidian', 'plugins');
const symlinkName = `${pluginId}-dist`;
const symlinkTarget = resolve(vaultPluginsDir, symlinkName);
const distPath = resolve(process.cwd(), 'dist');

// Remove existing symlink if any
if (existsSync(symlinkTarget)) {
	unlinkSync(symlinkTarget);
	console.log(`[link-vault] Removed existing symlink: ${symlinkName}`);
}

// Ensure dist exists
if (!existsSync(distPath)) {
	mkdirSync(distPath, { recursive: true });
}

// Create symlink
mkdirSync(vaultPluginsDir, { recursive: true });
symlinkSync(distPath, symlinkTarget, 'dir');
console.log(`[link-vault] Created symlink: ${symlinkTarget} -> ${distPath}`);

// Attempt to enable the plugin via Obsidian CLI
try {
	execSync(`obsidian plugin:enable ${pluginId}`, { stdio: 'pipe' });
	console.log(`[link-vault] Enabled plugin: ${pluginId}`);
} catch {
	console.log(`[link-vault] Could not auto-enable plugin. Enable it manually in Obsidian settings.`);
}
