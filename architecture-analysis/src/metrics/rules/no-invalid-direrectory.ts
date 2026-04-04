import { red, green, yellow } from 'kleur/colors';
import type { ClocResult } from '../../Types';
import { printRulesTable, type TableColumn } from '../../PrintTable';

type Violation = {
	domain: string;
	path: string;
	invalidFolders: string[];
};

const ALLOWED_FOLDERS = ['api', 'public', 'use-cases', 'internal', 'listeners', 'adapters'];

const DOMAIN_REGEX = /^src\/features\/([^/]+)\/(.+)/;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

function truncate(text: string, width: number): string {
	if (text.length <= width) return text;
	if (width <= 3) return text.slice(0, width);
	return `${text.slice(0, width - 3)}...`;
}

export function checkPortsAndAdaptersStructure(cloc: ClocResult): Violation[] {
	const domains = new Map<
		string,
		{
			domain: string;
			path: string;
			folders: Set<string>;
		}
	>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);
		const match = path.match(DOMAIN_REGEX);
		if (!match) continue;

		const [, domainName, rest] = match;
		const domainPath = `src/features/${domainName}`;

		if (!rest) continue;
		const firstFolder = rest.split('/')[0];

		const entry = domains.get(domainPath) ?? {
			domain: domainName,
			path: domainPath,
			folders: new Set<string>(),
		};

		if (firstFolder) entry.folders.add(firstFolder);

		if (!domains.has(domainPath)) domains.set(domainPath, entry);
	}

	const violations: Violation[] = [];

	for (const domain of domains.values()) {
		const invalidFolders = [...domain.folders].filter(
			(folder) => !ALLOWED_FOLDERS.includes(folder),
		);

		if (invalidFolders.length > 0) {
			violations.push({
				domain: domain.domain,
				path: domain.path,
				invalidFolders,
			});
		}
	}

	return violations;
}

export function printNoMissingDirectories(cloc: ClocResult): void {
	const violations = checkPortsAndAdaptersStructure(cloc);

	if (violations.length === 0) {
		console.log(green('? Rules: All features follow folder structure'));
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'FEATURE',
			width: 25,
			render: (v) => ({
				text: v.domain,
				color: red,
			}),
		},
		{
			header: 'FEATURE PATH',
			width: 55,
			render: (v) => ({
				text: truncate(v.path, 55),
			}),
		},
		{
			header: 'INVALID FOLDERS',
			width: 35,
			render: (v) => ({
				text: truncate(v.invalidFolders.join(', '), 35),
				color: yellow,
			}),
		},
		{
			header: 'STATUS',
			width: 12,
			align: 'right',
			render: () => ({
				text: 'VIOLATION',
				color: red,
			}),
		},
	];

	printRulesTable(
		`Feature folder structure violations (${violations.length})`,
		columns,
		violations,
	);
}
