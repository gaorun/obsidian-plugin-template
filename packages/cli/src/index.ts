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

// Template directory: packages/template/ relative to packages/cli/dist/
const templateDir = resolve(__dirname, '..', '..', 'template');

type Answers = {
	pluginName: string;
	pluginId: string;
	description: string;
	author: string;
	authorUrl: string;
	fundingUrl: string;
	vaultPath: string;
	targetDir: string;
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
			case '--description':
			case '-d':
				result.description = args[++i];
				break;
			case '--author':
			case '-a':
				result.author = args[++i];
				break;
			case '--author-url':
			case '-u':
				result.authorUrl = args[++i];
				break;
			case '--funding-url':
			case '-f':
				result.fundingUrl = args[++i];
				break;
			case '--vault-path':
			case '-v':
				result.vaultPath = args[++i];
				break;
			case '--out-dir':
			case '-o':
				result.targetDir = args[++i];
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
    -i, --id <id>             Plugin ID (default: kebab-case of name)
    -d, --description <desc>  Plugin description
    -a, --author <author>     Author name (default: from git config)
    -u, --author-url <url>    Author URL
    -f, --funding-url <url>   Funding URL
    -v, --vault-path <path>   Obsidian vault path
    -o, --out-dir <path>      Output directory (default: ./<plugin-id>)
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
		'{{AUTHOR_URL}}': answers.authorUrl,
		'{{FUNDING_URL}}': answers.fundingUrl,
		'{{VAULT_PATH}}': answers.vaultPath,
		'{{TARGET_DIR}}': answers.targetDir,
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

	// Resolve defaults with dependency order
	const resolvedName = cliArgs.pluginName ?? 'My Plugin';
	const resolvedId = cliArgs.pluginId ?? toKebabCase(resolvedName);
	const resolvedTarget =
		cliArgs.targetDir ?? resolve(process.cwd(), resolvedId);

	// Only ask for fields not provided via CLI args
	const pluginName =
		cliArgs.pluginName ?? (await ask('Plugin name', 'My Plugin'));
	const pluginId =
		cliArgs.pluginId ?? (await ask('Plugin ID', toKebabCase(pluginName)));
	const description =
		cliArgs.description ?? (await ask('Description', 'An Obsidian plugin'));
	const author =
		cliArgs.author ?? (await ask('Author', getGitConfig('user.name')));
	const authorUrl = cliArgs.authorUrl ?? (await ask('Author URL'));
	const fundingUrl = cliArgs.fundingUrl ?? (await ask('Funding URL'));
	const vaultPath = cliArgs.vaultPath ?? (await ask('Obsidian vault path'));
	const defaultTarget = resolve(process.cwd(), pluginId);
	const targetDir =
		cliArgs.targetDir ?? (await ask('Output directory', defaultTarget));

	const answers: Answers = {
		pluginName,
		pluginId,
		description,
		author,
		authorUrl,
		fundingUrl,
		vaultPath,
		targetDir,
	};

	// Validate template directory
	if (!existsSync(templateDir)) {
		console.error(`\n❌ Template directory not found: ${templateDir}`);
		console.error('   Make sure the CLI is running from the monorepo.\n');
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

	// Run pnpm install in the target directory
	console.log('\n  📦 Installing dependencies...');
	try {
		execSync('pnpm install', { cwd: targetDir, stdio: 'inherit' });
	} catch {
		console.log('  ⚠️  pnpm install failed. Run it manually after setup.');
	}

	console.log('\n  ──────────────────────────────────────');
	console.log(`  🎉 Plugin created at: ${targetDir}`);
	console.log('  ──────────────────────────────────────\n');
}

main().catch(console.error);
