#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, readFileSync, rmSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const pluginId = manifest.id;
const distPath = resolve(process.cwd(), 'dist');

// Get vault path from Obsidian CLI
let vaultPath;
try {
	vaultPath = execSync('obsidian vault', { encoding: 'utf8' }).trim();
} catch {
	vaultPath = '';
}

// Remove symlink
if (vaultPath) {
	const vaultPluginsDir = resolve(vaultPath, '.obsidian', 'plugins');
	const symlinkName = `${pluginId}-dist`;
	const symlinkTarget = resolve(vaultPluginsDir, symlinkName);
	if (existsSync(symlinkTarget)) {
		unlinkSync(symlinkTarget);
		console.log(`[clear] Removed symlink: ${symlinkName}`);
	}

	// Disable plugin
	try {
		execSync(`obsidian plugin:disable ${pluginId}`, { stdio: 'pipe' });
		console.log(`[clear] Disabled plugin: ${pluginId}`);
	} catch {
		console.log('[clear] Could not auto-disable plugin.');
	}
}

// Remove dist
if (existsSync(distPath)) {
	rmSync(distPath, { recursive: true, force: true });
	console.log('[clear] Removed dist directory');
}
