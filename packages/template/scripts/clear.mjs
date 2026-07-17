#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, readFileSync, rmSync } from 'fs';
import { resolve } from 'path';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const pluginId = manifest.id;
const distPath = resolve(process.cwd(), 'dist');

// Get vault path from Obsidian CLI
let vaultPath;
try {
	const raw = execSync('obsidian vault', { encoding: 'utf8' });
	const match = raw.match(/^path\t(.+)$/m);
	vaultPath = match ? match[1].trim() : '';
} catch {
	vaultPath = '';
}

// Remove plugin from vault
if (vaultPath) {
	const targetDir = resolve(vaultPath, '.obsidian', 'plugins', pluginId);
	if (existsSync(targetDir)) {
		rmSync(targetDir, { recursive: true, force: true });
		console.log(`[clear] Removed plugin directory: ${pluginId}`);
	}

	// Disable plugin
	try {
		execSync(`obsidian plugin:disable ${pluginId}`, { stdio: 'pipe' });
		console.log(`[clear] Disabled plugin: ${pluginId}`);
	} catch {
		console.log('[clear] Could not auto-disable plugin.');
	}
}

// Remove local dist
if (existsSync(distPath)) {
	rmSync(distPath, { recursive: true, force: true });
	console.log('[clear] Removed dist directory');
}
