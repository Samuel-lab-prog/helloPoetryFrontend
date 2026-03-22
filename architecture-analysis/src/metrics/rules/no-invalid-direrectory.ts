import { red, green, yellow } from 'kleur/colors';
import type { ClocResult } from '../../Types';
import { printTable, type TableColumn } from '../../PrintTable';

type Violation = {
	domain: string;
	path: string;
	missingFolders: string[];
};

const REQUIRED_FOLDERS = ['pages', 'components', 'hooks', 'use-cases'];

const DOMAIN_REGEX = /^src\/features\/([^/]+)\/(.+)/;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
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

		if (!entry) domains.set(domainPath, entry);
	}

	const violations: Violation[] = [];

	for (const domain of domains.values()) {
		const hasAny = REQUIRED_FOLDERS.some((f) => domain.folders.has(f));

		if (!hasAny) {
			violations.push({
				domain: domain.domain,
				path: domain.path,
				missingFolders: REQUIRED_FOLDERS,
			});
		}
	}

	return violations;
}

export function printNoMissingDirectories(cloc: ClocResult): void {
	const violations = checkPortsAndAdaptersStructure(cloc);

	if (violations.length === 0) {
		console.log(green('? All features follow folder structure'));
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
				text: v.path,
			}),
		},
		{
			header: 'MISSING FOLDERS',
			width: 35,
			render: (v) => ({
				text: v.missingFolders.join(', '),
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

	printTable(`Feature folder structure violations (${violations.length})`, columns, violations);
}
