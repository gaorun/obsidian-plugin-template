#!/usr/bin/env node

import { execSync } from 'child_process';
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from 'fs';
import { dirname, relative, resolve } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Template directory: bundled inside the CLI package at build time
const templateDir = resolve(__dirname, '..', 'template');

type Answers = {
	pluginName: string;
	pluginId: string;
	description: string;
	author: string;
	authorEmail: string;
};

function ask(query: string, defaultValue = ''): Promise<string> {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		const prompt = defaultValue ? `${query} (${defaultValue}): ` : `${query}: `;
		rl.question(prompt, (answer) => {
			rl.close();
			resolve(answer.trim() || defaultValue);
		});
	});
}

function toKebabCase(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function parseArgs(): Partial<Answers> {
	const args = process.argv.slice(2);
	const result: Partial<Answers> = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		switch (arg) {
			case '--name':
			case '-n':
				result.pluginName = args[++i];
				break;
			case '--id':
			case '-i':
				result.pluginId = args[++i];
				break;
			// Note: plugin ID is always auto-generated from name. Use --id to override.
			case '--description':
			case '-d':
				result.description = args[++i];
				break;
			case '--author':
			case '-a':
				result.author = args[++i];
				break;
			case '--email':
			case '-e':
				result.authorEmail = args[++i];
				break;
			case '--help':
			case '-h':
				printHelp();
				process.exit(0);
			default:
				if (arg.startsWith('-')) {
					console.error(`Unknown option: ${arg}`);
					printHelp();
					process.exit(1);
				}
		}
	}

	return result;
}

function printHelp(): void {
	console.log(`
  Usage: create-obsidian-plugin [options]

  Options:
    -n, --name <name>          Plugin name (default: My Plugin)
    -i, --id <id>             Plugin ID (auto: kebab-case of name)
    -d, --description <desc>  Plugin description
    -a, --author <author>     Author name (default: from git config)
    -e, --email <email>       Author email (default: from git config)
    -h, --help                Show this help message
  `);
}

function getGitConfig(key: string): string {
	try {
		return execSync(`git config --global ${key}`, { encoding: 'utf8' }).trim();
	} catch {
		return '';
	}
}

function collectFiles(dir: string): string[] {
	const result: string[] = [];
	if (!existsSync(dir)) return result;

	const entries = readdirSync(dir);
	for (const entry of entries) {
		if (entry === 'node_modules' || entry === '.git') continue;

		const fullPath = resolve(dir, entry);
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			result.push(...collectFiles(fullPath));
		} else {
			result.push(fullPath);
		}
	}
	return result;
}

function replacePlaceholders(content: string, answers: Answers): string {
	const map: Record<string, string> = {
		'{{PLUGIN_ID}}': answers.pluginId,
		'{{PLUGIN_NAME}}': answers.pluginName,
		'{{DESCRIPTION}}': answers.description,
		'{{AUTHOR}}': answers.author,
		'{{AUTHOR_EMAIL}}': answers.authorEmail,
	};
	let result = content;
	for (const [key, value] of Object.entries(map)) {
		result = result.replaceAll(key, value);
	}
	return result;
}

async function main() {
	console.log('\n  ╔══════════════════════════════════════╗');
	console.log('  ║   Create Obsidian Plugin            ║');
	console.log('  ╚══════════════════════════════════════╝\n');

	// Parse CLI arguments first
	const cliArgs = parseArgs();

	// Only ask for fields not provided via CLI args
	const pluginName =
		cliArgs.pluginName ?? (await ask('Plugin name', 'My Plugin'));
	const pluginId = cliArgs.pluginId ?? toKebabCase(pluginName);
	const description =
		cliArgs.description ?? (await ask('Description', 'An Obsidian plugin'));
	const author =
		cliArgs.author ?? (await ask('Author', getGitConfig('user.name')));
	const authorEmail =
		cliArgs.authorEmail ??
		(await ask('Author email', getGitConfig('user.email')));

	const targetDir = resolve(process.cwd(), pluginId);

	const answers: Answers = {
		pluginName,
		pluginId,
		description,
		author,
		authorEmail,
	};

	// Validate template directory
	if (!existsSync(templateDir)) {
		console.error(`\n❌ Template directory not found: ${templateDir}\n`);
		process.exit(1);
	}

	// Ensure target directory exists
	mkdirSync(targetDir, { recursive: true });

	// Read all files from template directory
	const files = collectFiles(templateDir);

	for (const file of files) {
		const relativePath = relative(templateDir, file);
		const targetPath = resolve(targetDir, relativePath);

		mkdirSync(dirname(targetPath), { recursive: true });

		const content = readFileSync(file, 'utf8');
		const replaced = replacePlaceholders(content, answers);

		writeFileSync(targetPath, replaced, 'utf8');
		console.log(`  ✅ ${relativePath}`);
	}

	// Ensure .npmrc with public registry is present
	writeFileSync(
		resolve(targetDir, '.npmrc'),
		'tag-version-prefix=""\nregistry=https://registry.npmjs.org/\n',
		'utf8',
	);

	// Run pnpm install in the target directory
	console.log('\n  📦 Installing dependencies...');
	try {
		execSync('pnpm install --registry https://registry.npmjs.org/', {
			cwd: targetDir,
			stdio: 'inherit',
		});
	} catch {
		console.log('  ⚠️  pnpm install failed. Run it manually after setup.');
	}

	console.log('\n  ──────────────────────────────────────');
	console.log(`  🎉 Plugin created at: ${targetDir}`);
	console.log('  ──────────────────────────────────────\n');
}

main().catch(console.error);
